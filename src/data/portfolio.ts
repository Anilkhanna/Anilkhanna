import data from "./portfolio.json";

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  linkedinUrl: string;
}

export const siteConfig = data.siteConfig;
export const sectionHeadings = data.sectionHeadings;
export const navLinks = data.navLinks;
export const socialLinks = data.socialLinks;
export const aboutData = data.aboutData;
export const trendingSkills = data.trendingSkills;
export const techStack = data.techStack;
export const techCategories = data.techCategories;
export const whatIDo = data.whatIDo;
export const careerData = data.careerData;
export const projectsData = data.projectsData;
export const products = data.products;
export const initiatives = data.initiatives;
export const educationData = data.educationData;
export const certifications = data.certifications;
export const availability = data.availability;
export const testimonials: Testimonial[] = data.testimonials;
export const caseStudies = data.caseStudies;
export const services = data.services;
