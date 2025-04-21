from django.db import models
from django.contrib.auth.models import User

class GDPRConsent(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    consented = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"GDPR Consent for {self.user.username} at {self.timestamp}"