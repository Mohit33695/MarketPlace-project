from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, FarmerProfile, BuyerProfile


class FarmerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerProfile
        fields = ['farm_name', 'location', 'state', 'phone', 'bio', 'is_verified', 'rating', 'total_sales']


class BuyerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerProfile
        fields = ['phone', 'address', 'city', 'state', 'pincode']


class UserSerializer(serializers.ModelSerializer):
    farmer_profile = FarmerProfileSerializer(read_only=True)
    buyer_profile = BuyerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_approved',
                  'date_joined', 'profile_image', 'farmer_profile', 'buyer_profile']
        read_only_fields = ['id', 'date_joined', 'is_approved']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    farm_name = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password2',
                  'role', 'farm_name', 'location', 'phone']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        if data.get('role') == 'farmer':
            if not data.get('farm_name'):
                raise serializers.ValidationError({'farm_name': 'Farm name is required for farmers.'})
        return data

    def create(self, validated_data):
        farm_name = validated_data.pop('farm_name', '')
        location = validated_data.pop('location', '')
        phone = validated_data.pop('phone', '')
        validated_data.pop('password2')

        role = validated_data.get('role', 'buyer')
        # Buyers are auto-approved; farmers need admin approval
        is_approved = True if role == 'buyer' else False
        user = User.objects.create_user(**validated_data, is_approved=is_approved)

        if role == 'farmer':
            FarmerProfile.objects.create(user=user, farm_name=farm_name, location=location, phone=phone)
        else:
            BuyerProfile.objects.create(user=user, phone=phone)

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        data['user'] = user
        return data


class TokenResponseSerializer(serializers.Serializer):
    """Returns user info + JWT tokens."""
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()

    @staticmethod
    def get_tokens(user):
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }
