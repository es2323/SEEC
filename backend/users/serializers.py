from django.contrib.auth.models import User
from rest_framework import serializers
from .models import GDPRConsent

class UserSerializer(serializers.ModelSerializer):
    gdpr_consent = serializers.BooleanField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'gdpr_consent']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_password(self, value):
        if len(value) < 8 or not any(c.isdigit() for c in value) or not any(c in "!@#$%^&*()_+" for c in value):
            raise serializers.ValidationError("Password must be at least 8 characters, with 1 number and 1 special character.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already registered.")
        return value

    def create(self, validated_data):
        gdpr_consent = validated_data.pop('gdpr_consent')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        GDPRConsent.objects.create(user=user, consented=gdpr_consent)
        return user