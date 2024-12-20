export type RegisterArgs = {
  lastname: string
  firstname: string
  pseudo: string
  email: string
  password: string
}

export default interface IAuthService {
  register(args: RegisterArgs): Promise<boolean>
}
