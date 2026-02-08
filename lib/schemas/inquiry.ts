import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required").max(5000),
});

export const bookingFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  packageId: z.string().min(1, "Package is required"),
  packageName: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  adults: z.coerce.number().min(1).default(2),
  children: z.coerce.number().min(0).default(0),
  infants: z.coerce.number().min(0).default(0),
  message: z.string().min(1, "Message is required").max(5000),
  specialRequests: z.string().optional(),
  arrivalFlight: z.string().optional(),
  departureFlight: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type BookingFormData = z.infer<typeof bookingFormSchema>;
