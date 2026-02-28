export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  email: string;
}

export const adminUsers: AdminUser[] = [
  {
    id: "1",
    username: "karam",
    passwordHash:
      "$2b$10$j2EWwFx4D.BlhWCE1a6By.ZaPnGBgVPCrGhskszNWutmcnpi8/s8q",
    name: "Karam",
    email: "karam@islandhype.com",
  },
  {
    id: "2",
    username: "hordor",
    passwordHash:
      "$2b$10$9G.txsyk5tadkXMDkh4W0OhCyPDJ1xNqcyIVGFUZC1GAChf2.iN72",
    name: "Hordor",
    email: "hordor@islandhype.com",
  },
  {
    id: "3",
    username: "faizan",
    passwordHash:
      "$2b$10$Tr5xiUbQ9eNLHOfZ1DiAD.IDoLw6zP3.JVFZiYju0KZdJbYkaAhFW",
    name: "Faizan",
    email: "faizan@islandhype.com",
  },
  {
    id: "4",
    username: "shinko",
    passwordHash:
      "$2b$10$HEMbWi.nAc5yk3gqJi/H2.PoNUGKV7jemWI2JAx2Ht8MdWtgQbyN.",
    name: "Shinko",
    email: "shinko@islandhype.com",
  },
];

export function findUserByUsername(username: string): AdminUser | undefined {
  return adminUsers.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

export function findUserById(id: string): AdminUser | undefined {
  return adminUsers.find((u) => u.id === id);
}
