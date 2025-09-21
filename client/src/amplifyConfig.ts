// src/amplifyConfig.ts
const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_pE26qmN2e", // your User Pool ID
      userPoolClientId: "3kf9v98lsnrv4m874lkct4qep7", // your App Client ID
      signUpVerificationMethod: "code" as const, // 👈 ensure literal type
      loginWith: {
        email: true,
        phone: false,
        username: false,
      },
      oauth: {
        domain: "your-domain.auth.us-east-1.amazoncognito.com", // replace with actual Cognito domain
        scopes: ["email", "openid", "profile"],
        redirectSignIn: "http://localhost:5173/", // 👈 must be string, not array
        redirectSignOut: "http://localhost:5173/",
        responseType: "code" as const, // 👈 ensure literal type
      },
    },
  },
};

export default awsconfig;