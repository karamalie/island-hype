// lib/data/home.ts
import { prisma } from "@/lib/prisma";

export async function getFeaturedPackages() {
  return prisma.package.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    include: {
      location: true,
      accommodation: true,
      pricing: true,
      experiences: {
        include: {
          experience: true,
        },
      },
    },
    take: 5,
  });
}

export async function getAllPackages() {
  return prisma.package.findMany({
    where: {
      isActive: true,
    },
    include: {
      location: true,
      accommodation: true,
      pricing: true,
    },
  });
}

export async function getExperiences() {
  return prisma.experience.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getLocations() {
  return prisma.location.findMany({
    where: {
      isFeatured: true,
    },
    include: {
      experiences: {
        include: {
          experience: true,
        },
      },
    },
  });
}

export async function getAccommodations() {
  return prisma.accommodation.findMany({
    include: {
      location: true,
    },
    take: 6,
  });
}

export async function getActivities() {
  return prisma.activity.findMany({
    include: {
      location: true,
    },
    take: 10,
  });
}

// Types for the home page
export type FeaturedPackage = Awaited<
  ReturnType<typeof getFeaturedPackages>
>[number];
export type Experience = Awaited<ReturnType<typeof getExperiences>>[number];
export type Location = Awaited<ReturnType<typeof getLocations>>[number];
export type Accommodation = Awaited<
  ReturnType<typeof getAccommodations>
>[number];
