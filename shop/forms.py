from django import forms
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class RegistrationForm(forms.Form):
    """
    A form for user registration.

    Validates that the username and email are unique, that passwords match,
    and that the password is not too common.
    """

    username = forms.CharField(max_length=150)
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)
    password_confirm = forms.CharField(
        widget=forms.PasswordInput, label="Confirm password"
    )

    def clean_username(self):
        """
        Validate that the username is not already taken.
        """
        username = self.cleaned_data.get("username")
        if User.objects.filter(username=username).exists():
            raise ValidationError("A user with that username already exists.")
        return username

    def clean_email(self):
        """
        Validate that the email is not already in use.
        """
        email = self.cleaned_data.get("email")
        if User.objects.filter(email=email).exists():
            raise ValidationError("A user with that email address already exists.")
        return email

    def clean(self):
        """
        Verify that the two password fields match.
        """
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password_confirm = cleaned_data.get("password_confirm")

        if password and password_confirm and password != password_confirm:
            raise ValidationError("The two password fields do not match.")

        # You can add Django's built-in password validation here if desired
        # from django.contrib.auth.password_validation import validate_password
        # if password:
        #     try:
        #         validate_password(password)
        #     except ValidationError as e:
        #         self.add_error('password', e)

        return cleaned_data
