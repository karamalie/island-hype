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
    username: "kara",
    passwordHash:
      "$2b$10$KHcO9RL8iiewIA5921C/Y.tIOY.Qdt3Y2CtrwendL2mGnunTRII5K",
    name: "Kara",
    email: "kara@islandhype.com",
  },
  {
    id: "2",
    username: "hordor",
    passwordHash:
      "$2b$10$FPBqH6KHJEqkkQMejEgruOs7VZ4IO84Ea7pnb7xNMwBc5W7snUw5W",
    name: "Hordor",
    email: "hordor@islandhype.com",
  },
  {
    id: "3",
    username: "faizan",
    passwordHash:
      "$2b$10$Z9sKuT2GovJggch1mhuwreMr2B9GT.e6vbYPHpJag4AFwJ3s13Tve",
    name: "Faizan",
    email: "faizan@islandhype.com",
  },
  {
    id: "4",
    username: "shinko",
    passwordHash:
      "$2b$10$2ZJ9XPISB2vrzBC.96FDPOiWgV4YQQAN71Q6HZAvdj8VVu9Z5j0c2",
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
