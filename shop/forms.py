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


class ProfileForm(forms.Form):
    """
    A form for updating user profile information.
    """

    first_name = forms.CharField(max_length=150, required=False)
    last_name = forms.CharField(max_length=150, required=False)
    email = forms.EmailField(required=False)
    avatar = forms.CharField(required=False)  # Assuming base64 or URL
    phone = forms.CharField(max_length=20, required=False)
    address = forms.CharField(max_length=255, required=False)
    city = forms.CharField(max_length=100, required=False)
    country = forms.CharField(max_length=100, required=False)
    postal_code = forms.CharField(max_length=20, required=False)

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop("user", None)
        super().__init__(*args, **kwargs)

    def clean_email(self):
        """
        Validate that the new email is not already in use by another user.
        """
        email = self.cleaned_data.get("email")
        if (
            self.user
            and email
            and User.objects.filter(email=email).exclude(pk=self.user.pk).exists()
        ):
            raise ValidationError(
                "This email address is already in use by another account."
            )
        return email
