import User from '../model/User'

export default interface IAuthRepository {
  register(user: User): Promise<User | undefined>
}
