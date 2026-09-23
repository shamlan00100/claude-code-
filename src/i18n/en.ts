export const en = {
  app: {
    name: 'Focus PT',
  },
  nav: {
    today: 'Today',
    clients: 'Clients',
    programs: 'Programs',
    profile: 'Profile',
    train: 'Train',
    history: 'History',
  },
  auth: {
    signInTitle: 'Sign in',
    signUpTitle: 'Create your trainer account',
    name: 'Full name',
    namePlaceholder: 'e.g. Sara Ahmed',
    email: 'Email',
    emailPlaceholder: 'e.g. sara@example.com',
    password: 'Password',
    passwordHint: 'At least 8 characters.',
    signIn: 'Sign in',
    signUp: 'Create account',
    noAccount: 'New trainer?',
    haveAccount: 'Already have an account?',
    toSignUp: 'Create an account',
    toSignIn: 'Sign in',
    signInFailed: "That email and password don't match. Try again.",
    signUpFailed:
      "Couldn't create the account. Check the details and try again.",
    quickTitle: 'Development sign-in',
    quickTrainer: 'Continue as trainer',
    quickClient: 'Continue as client',
  },
  today: {
    trainerEmpty: 'No sessions booked today.',
    clientEmpty: 'Nothing scheduled today.',
    addClient: 'Add a client',
  },
  clients: {
    empty: 'No clients yet.',
    add: 'Add a client',
  },
  programs: {
    empty: 'No programs yet.',
    create: 'Create a program',
  },
  train: {
    empty: 'No workout assigned yet.',
  },
  history: {
    empty: 'No sessions logged yet.',
  },
  profile: {
    title: 'Profile',
    role: {
      trainer: 'Trainer',
      client: 'Client',
      admin: 'Admin',
    },
    language: 'Language',
    theme: 'Appearance',
    themeSystem: 'Match device',
    themeLight: 'Light',
    themeDark: 'Dark',
    signOut: 'Sign out',
  },
  common: {
    comingNext: 'This part is built next.',
  },
}

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> }

export type Messages = Widen<typeof en>
