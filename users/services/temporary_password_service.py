import secrets
import string


class TemporaryPasswordService:

    @staticmethod
    def generate_password(length=10):

        characters = (
            string.ascii_letters
            + string.digits
        )

        return ''.join(
            secrets.choice(characters)
            for _ in range(length)
        )