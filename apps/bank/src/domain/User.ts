export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export function userFullName(u: User) {
  return `${u.firstName} ${u.lastName}`;
}

export default User;
