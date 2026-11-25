from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from home.views import dummy_data_input
from home.models import Voters, PoliticalParty, Vote, Block

class Command(BaseCommand):
    help = 'Seeds realistic election data (parties, citizens, initial votes) for testing and viva presentation.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--votes',
            action='store_true',
            default=True,
            help='Cast initial sample votes into the mempool (leaves 4 citizens unvoted)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Initializing and seeding election database...'))
        
        # Ensure default superuser admin / admin123 exists for /admin access
        admin_user = User.objects.filter(username='admin').first()
        if not admin_user:
            User.objects.create_superuser('admin', 'admin@securevote.org', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created default superuser: admin (password: admin123)'))
        else:
            admin_user.set_password('admin123')
            admin_user.is_superuser = True
            admin_user.is_staff = True
            admin_user.save()

        dummy_data_input({
            'createPoliticianParties': True,
            'createRandomVoters': True,
            'castRandomVote': options['votes']
        })
        self.stdout.write(self.style.SUCCESS(
            f'Successfully seeded database:\n'
            f'- Superuser (Django Admin): admin / admin123\n'
            f'- Political Parties: {PoliticalParty.objects.count()}\n'
            f'- Registered Citizens: {Voters.objects.count()} (4 ready to vote, 6 initial votes cast)\n'
            f'- Votes in Mempool: {Vote.objects.filter(block_id=None).count()}\n'
            f'- Sealed Blocks: {Block.objects.count()}'
        ))

