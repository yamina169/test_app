export const SEND_VERIFICATION_EMAIL = `
  mutation SendVerificationEmail($input: SendEmailInput!) {
    sendVerificationEmail(input: $input)
  }
`;

export const LOGIN_WITH_EMAIL = `
  mutation LoginWithEmail($input: LoginWithEmailInput!) {
    loginWithEmail(input: $input) {
      accessToken
      message
    }
  }
`;

export const LOGIN_WITH_HANDICAP_CARD = `
  mutation LoginWithHandicapCard($input: LoginWithHandicapCardInput!) {
    loginWithHandicapCard(input: $input)
  }
`;

export const REQUEST_PASSWORD_RESET = `
  mutation RequestPasswordReset($input: SendEmailInput!) {
    requestPasswordReset(input: $input)
  }
`;

export const RESET_PASSWORD = `
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;

export const LOGOUT = `
  mutation Logout {
    logout
  }
`;
export const REGISTER = `
  mutation Register($input: RegisterInput!, $files: [Upload!], $documentTypes: [String!]) {
    register(input: $input, files: $files, documentTypes: $documentTypes) {
      id
      fullName
      email
      phone
      status
      roleId
      createdAt
      updatedAt
      handicapProfile {
        handicapCardId
        dateOfBirth
        governorate
        city
        handicapType
        requiredAccommodation
        occupationStatus
        caregiver
      }
      institutionProfile {
        institutionName
        institutionPhone
        institutionEmail
        institutionGovernorate
        institutionCity
        website
        typeOfServices
        accessible
        specificEquipment
      }
    }
  }
`;
