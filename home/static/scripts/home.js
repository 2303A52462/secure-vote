$(document).ready(function () {
    hide_loading();
    showAlert(
        'Welcome! Enter your Aadhaar number or select a registered citizen below to begin.',
        'rgba(238, 242, 255, 0.95)', '#4338ca');

    // Support Enter key on input
    $('#aadhar').on('keypress', function (e) {
        if (e.which === 13) {
            submit_aadhar();
        }
    });

    // Load live sample voters from server
    loadSampleVoters();
});

// Select a demo voter
function selectDemoVoter(uuid) {
    $('#aadhar').val(formatAadhaar(uuid));
    $('#auth-inline-msg').hide();
    submit_aadhar();
}

// Reset a voter so the user can test again immediately
function resetDemoVoter(uuid) {
    show_loading('Resetting voting status for citizen...');
    $.ajax({
        type: 'POST',
        url: '/reset-voter/',
        data: {'uuid': uuid},
        success: function(resp) {
            hide_loading();
            if(resp.success) {
                showAlert(resp.message, 'rgba(236, 253, 245, 0.95)', '#047857');
                $('#auth-inline-msg').hide();
                $('#aadhar').val(formatAadhaar(uuid));
                loadSampleVoters();
                submit_aadhar();
            } else {
                showAlert(resp.error, 'rgba(255, 241, 242, 0.95)', '#b91c1c', 'vibrate');
            }
        },
        error: function() {
            hide_loading();
            showAlert('Failed to reset voter status.', 'rgba(255, 241, 242, 0.95)', '#b91c1c', 'vibrate');
        }
    });
}

function loadSampleVoters() {
    $.ajax({
        type: 'GET',
        url: '/api/sample-voters/',
        success: function (data) {
            if (data.unvoted && data.unvoted.length > 0) {
                var readyHtml = '';
                for (var v of data.unvoted) {
                    var phoneTag = v.phone ? '<span>📱 +91 ' + v.phone + '</span>' : '';
                    var emailTag = v.email ? '<span>✉️ ' + v.email + '</span>' : '';
                    readyHtml += '<div class="demo-chip ready" onclick="selectDemoVoter(\'' + v.uuid + '\')" role="button" tabindex="0">' +
                        '<div class="demo-chip-top-row">' +
                        '<span class="demo-chip-name">' + v.name + '</span>' +
                        '<span class="demo-chip-badge">READY TO VOTE</span>' +
                        '</div>' +
                        '<span class="demo-chip-uid">' + formatAadhaar(v.uuid) + '</span>' +
                        '<div class="demo-chip-contact">' + phoneTag + emailTag + '</div>' +
                        '</div>';
                }
                $('#ready-voters').html(readyHtml);
            }
            if (data.voted && data.voted.length > 0) {
                var votedHtml = '';
                for (var v of data.voted) {
                    var phoneTag = v.phone ? '<span>📱 +91 ' + v.phone + '</span>' : '';
                    var emailTag = v.email ? '<span>✉️ ' + v.email + '</span>' : '';
                    votedHtml += '<div class="demo-chip voted" onclick="selectDemoVoter(\'' + v.uuid + '\')" role="button" tabindex="0">' +
                        '<div class="demo-chip-top-row">' +
                        '<span class="demo-chip-name">' + v.name + '</span>' +
                        '<span class="demo-chip-badge">ALREADY VOTED</span>' +
                        '</div>' +
                        '<span class="demo-chip-uid">' + formatAadhaar(v.uuid) + '</span>' +
                        '<div class="demo-chip-contact">' + phoneTag + emailTag + '</div>' +
                        '</div>';
                }
                $('#voted-voters').html(votedHtml);
                $('#voted-group').show();
            } else {
                $('#voted-group').hide();
            }
        }
    });
}

function formatAadhaar(val) {
    var digits = ('' + val).replace(/\D/g, '');
    if (digits.length === 12) {
        return digits.substring(0, 4) + ' ' + digits.substring(4, 8) + ' ' + digits.substring(8, 12);
    }
    return val;
}

// Aadhaar input formatting
$('#aadhar').on('input', function () {
    $('#auth-inline-msg').hide();
    var raw = $(this).val().replace(/\D/g, '');
    if (raw.length > 12) {
        raw = raw.substring(0, 12);
    }
    if (raw.length > 8) {
        $(this).val(raw.substring(0, 4) + ' ' + raw.substring(4, 8) + ' ' + raw.substring(8));
    } else if (raw.length > 4) {
        $(this).val(raw.substring(0, 4) + ' ' + raw.substring(4));
    } else {
        $(this).val(raw);
    }
});

// Authenticate Aadhaar no after button click
function submit_aadhar() {
    var aadhar_raw = $('#aadhar').val().replace(/\s+/g, '').replace(/-/g, '');
    if (!aadhar_raw) {
        showInlineError('Please enter a 12-digit Aadhaar card number.');
        showAlert('Please enter an Aadhaar card number.', 'rgba(255, 241, 242, 0.95)', '#b91c1c', 'vibrate');
        return;
    }

    show_loading('Verifying identity against Electoral Registry (UIDAI)...');
    $('#auth-inline-msg').hide();

    function handleAuthSuccess(data) {
        if (data.success) {
            candidate_details_json = data.details;

            showAlert(
                'Citizen Authenticated! Proceeding to 2FA verification.',
                'rgba(236, 253, 245, 0.95)', '#047857');
            
            $('.main-content').html(data.html);
            hide_loading();
            showShortDetails();
        } else {
            hide_loading();
            showAlert(data.error, 'rgba(255, 241, 242, 0.95)', '#b91c1c', 'vibrate');
            
            if (data.already_voted) {
                var resetBtnHtml = '<div style="margin-top: 10px;">' +
                    '<button type="button" onclick="resetDemoVoter(\'' + (data.voter_uuid || aadhar_raw) + '\')" ' +
                    'style="background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 700; box-shadow: 0 2px 6px rgba(79,70,229,0.3);">' +
                    '🔄 Reset Vote Status (Allow Re-Testing for Evaluation)' +
                    '</button></div>';
                showInlineError('<strong>⚠️ Duplicate Vote Rejected:</strong> ' + data.error + resetBtnHtml);
            } else {
                showInlineError('<strong>⚠️ Authentication Failed:</strong> ' + data.error);
            }
        }
    }

    // Try POST first
    $.ajax({
        type: "POST",
        url: "/authentication/",
        data: {'aadhar_no': aadhar_raw},
        success: handleAuthSuccess,
        error: function (xhr, status, err) {
            // Fallback to GET if POST is blocked by proxy or CSRF
            $.ajax({
                type: "GET",
                url: "/authentication/",
                data: {'aadhar_no': aadhar_raw},
                success: handleAuthSuccess,
                error: function(xhr2, status2, err2) {
                    hide_loading();
                    var msg = 'Authentication request failed (' + (err2 || err || 'Network Error') + ').';
                    showInlineError(msg);
                    showAlert(msg, 'rgba(255, 241, 242, 0.95)', '#b91c1c', 'vibrate');
                }
            });
        }
    });
}

function showInlineError(msg) {
    $('#auth-inline-msg').css({
        'background': '#fef2f2',
        'border': '1px solid #fecaca',
        'color': '#991b1b',
        'display': 'block'
    }).html(msg);
}

// Show short Details at top right corner after authentication
function showShortDetails() {
    if (candidate_details_json) {
        $('.basic-details').html(candidate_details_json.name + ' (' + formatAadhaar(candidate_details_json.uuid) + ')');
        $('.profile-pic').first().attr('src', candidate_details_json.profile_pic || '/static/images/profile-bg.png');
        $('.short-details').css('display', 'inline-flex');
    }
}
