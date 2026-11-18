var selected;

$('#search').on('input', function () {
    var query = $('#search').val().toLowerCase();
    for (var party of parties_list_json) {
        var matchName = party.party_name.toLowerCase().includes(query);
        var matchCand = party.candidate_name ? party.candidate_name.toLowerCase().includes(query) : false;
        if (matchName || matchCand) {
            $('#' + party.party_id).css('display', 'flex');
        } else {
            $('#' + party.party_id).css('display', 'none');
        }
    }
});

// Auto-fill key button
$(document).off('click', '#auto-fill-key-btn').on('click', '#auto-fill-key-btn', function (e) {
    e.preventDefault();
    if (typeof generated_voter_private_key !== 'undefined' && generated_voter_private_key) {
        $('#private-key-input').val(generated_voter_private_key);
        showAlert('ECDSA Private Key auto-filled.', 'rgba(236, 253, 245, 0.95)', '#047857');
    } else {
        showAlert('No key in session. Please paste manually.', 'rgba(255, 241, 242, 0.95)', '#b91c1c', 'vibrate');
    }
});

// Download key button
$(document).off('click', '#download-key-btn').on('click', '#download-key-btn', function (e) {
    e.preventDefault();
    var key = $('#private-key-input').val() || generated_voter_private_key;
    if (!key) {
        showAlert('No private key available to download.', 'rgba(255, 241, 242, 0.95)', '#b91c1c', 'vibrate');
        return;
    }
    var blob = new Blob([key], { type: 'application/x-pem-file' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'voter_private_key.pem';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showAlert('Key downloaded as voter_private_key.pem', 'rgba(236, 253, 245, 0.95)', '#047857');
});

// When an option is clicked
$('.option').click(function () {

    if (selected) {
        $(selected).removeClass('selected-card');
        $(selected).children('.final-decision').remove();
    }

    selected = this;
    $(this).addClass('selected-card');

    $(this).append("<div class='final-decision'><a id='vote' role='button' tabindex='0'>✓ Select & Sign Ballot</a></div>");

    $('#vote').click(function (e) {
        e.stopPropagation();
        showAlert('Review ballot selection and verify with ECDSA signature.', 'rgba(238, 242, 255, 0.95)', '#4338ca');
        $('.dialog').css('display', 'flex');
        $('.vote-confirmation').removeClass('confirmVoteDialoge-slide-fade-out');
        $('.vote-confirmation').addClass('confirmVoteDialoge-slide-fade-in');
        $('.confirmation-party-logo').attr('src', $(selected).find('img').attr('src'));
        $('.confirmation-party-name').html($(selected).find('.party-name div:first-child').html());

        // Pre-fill generated key by default for easy workflow
        if (typeof generated_voter_private_key !== 'undefined' && generated_voter_private_key && !$('#private-key-input').val()) {
            $('#private-key-input').val(generated_voter_private_key);
        }
    });
});

$('#final-confirm').click(function () {
    var selectedPartyID = $(selected).attr('id');
    var privateKey = $('#private-key-input').val().trim();

    if (!privateKey) {
        showAlert('Private Key is required to digitally sign the ballot!', 'rgba(255, 241, 242, 0.95)', '#b91c1c', 'vibrate');
        return;
    }

    showAlert('Cryptographically signing ballot with SHA3-256 and ECDSA...', 'rgba(238, 242, 255, 0.95)', '#4338ca');
    $('.party-selection').remove();

    // Flash party logo and name
    $('.all-done').css('display', 'flex');
    $('.voted-party-image').attr('src', $(selected).find('img').attr('src'));
    $('.final-message').html('Your Vote:<br>' + $(selected).find('.party-name div:first-child').html());

    hideSelectedPartyLogo();

    $.ajax({
        type: 'POST',
        url: '/create-vote/',
        data: {
            'selected-party-id': selectedPartyID,
            'private-key': privateKey
        },
        success: function (data) {
            $('.all-done').append(data.html);
            $('.all-done').addClass('all-done-rotate-collapse');

            showFinalStatus();

            if (data.success) {
                showAlert('Vote sealed in mempool with valid digital signature!', 'rgba(236, 253, 245, 0.95)', '#047857');
            }
            else {
                showAlert(data.status || 'Signature verification failed!', 'rgba(255, 241, 242, 0.95)', '#b91c1c', 'vibrate');
            }
        },
        error: function (err) {
            showAlert('Failed to submit vote to blockchain network.', 'rgba(255, 241, 242, 0.95)', '#b91c1c', 'vibrate');
        }
    });

});

$('#cancel-confirm').click(function () {
    showAlert('Ballot signing canceled.', 'rgba(238, 242, 255, 0.95)', '#4338ca');
    $('.vote-confirmation').removeClass('confirmVoteDialoge-slide-fade-in');
    $('.vote-confirmation').addClass('confirmVoteDialoge-slide-fade-out');
    setTimeout(function () {
        $('.dialog').css('display', 'none');
    }, 350);
});

function hideSelectedPartyLogo() {
    $('.selected-party').animate({
        'opacity': '0'
    }, 1200);

    setTimeout(function () {
        $('.selected-party').animate({
            'height': '0',
            'width': '0',
        }, 500);
        setTimeout(function () {
            $('.selected-party').remove();
        }, 500);
    }, 1200);
}

function showFinalStatus() {
    setTimeout(function () {
        $('.front').hide();
        $('.final-status-container').show();
        $('.all-done').removeClass('all-done-rotate-collapse');
        $('.all-done').addClass('all-done-rotate-expand');
    }, 400);
}
