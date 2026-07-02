from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from masters.models import (
    Association,
    StateMaster,
    DistrictMaster
)

class Role(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class AppUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class AppUser(AbstractBaseUser, PermissionsMixin):
    ORGANIZER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    ASSOCIATION_TYPE_CHOICES = [
        ('district', 'District'),
        ('state', 'State'),
        ('national', 'National'),
        ('club', 'Club'),
    ]
    username = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    first_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    middle_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    last_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    email_verified = models.BooleanField(
        default=False
    )

    must_change_password = models.BooleanField(
        default=False
    )

    temporary_password_sent = models.BooleanField(
        default=False
    )
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)
    address_line1 = models.CharField(max_length=255, null=True, blank=True)
    address_line2 = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    postal_code = models.CharField(max_length=20, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    GENDER_CHOICES = [
        ("MALE", "Male"),
        ("FEMALE", "Female"),
    ]

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        null=True,
        blank=True
    )
    CURRENT_LEVEL_CHOICES = [
        ("DISTRICT", "District"),
        ("STATE", "State"),
        ("NATIONAL", "National"),
    ]

    current_level = models.CharField(
        max_length=20,
        choices=CURRENT_LEVEL_CHOICES,
        default="DISTRICT"
    )

    coach_level = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    organizer_level = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    highest_level_reached = models.CharField(
        max_length=20,
        choices=CURRENT_LEVEL_CHOICES,
        default="DISTRICT"
    )
    otp = models.CharField(max_length=6, null=True, blank=True)
    email_verification_token = models.UUIDField(
        null=True,
        blank=True,
        unique=True
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True
    )
    association = models.ForeignKey(
        Association,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="users"
    )
    state_master = models.ForeignKey(
        StateMaster,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="users"
    )

    district_master = models.ForeignKey(
        DistrictMaster,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="users"
    )
    association_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    association_type = models.CharField(
        max_length=20,
        choices=ASSOCIATION_TYPE_CHOICES,
        blank=True,
        null=True
    )

    contact_information = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    organizer_document = models.FileField(
        upload_to='organizer_documents/',
        blank=True,
        null=True
    )

    organizer_status = models.CharField(
        max_length=20,
        choices=ORGANIZER_STATUS_CHOICES,
        default='pending'
    )

    approved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    rejection_reason = models.TextField(
        blank=True,
        null=True
    )

    approved_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_organizers'
    )

    objects = AppUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def promote_to_state(self):
        self.current_level = "STATE"

        if self.highest_level_reached == "DISTRICT":
            self.highest_level_reached = "STATE"

        self.save()

    def promote_to_national(self):
        self.current_level = "NATIONAL"

        self.highest_level_reached = "NATIONAL"

        self.save()

    def __str__(self):
        return self.email or self.phone_number