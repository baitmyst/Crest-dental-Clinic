import { PrismaClient, Role, AppointmentStatus, BookingSource, InquiryStatus, PostStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning old database records...");
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.appointmentRequest.deleteMany();
  await prisma.contactInquiry.deleteMany();
  await prisma.timeOff.deleteMany();
  await prisma.blockedSlot.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.dentistService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.dentistProfile.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.blogCategory.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.clinicLocation.deleteMany();
  await prisma.siteSettings.deleteMany();

  console.log("Seeding Site Settings & Location...");
  const location = await prisma.clinicLocation.create({
    data: {
      name: "Dr. Dental Crest Dental Surgery",
      address: null, // Unverified - default null
      directionsNote: "Visit our Kampala clinic. Please call us for directions.",
      phone: "+256 773 003214",
      email: null, // Unverified - default null
      timezone: "Africa/Kampala",
      isPublicAddressVerified: false,
      isActive: true,
    },
  });

  await prisma.siteSettings.create({
    data: {
      id: "default",
      clinicName: "Dr. Dental Crest Dental Surgery",
      primaryColor: "#181d26",
      secondaryColor: "#0a2e0e",
      accentColor: "#aa2d00",
      contactPhone: "+256 773 003214",
      contactEmail: null,
      whatsappNumber: null,
      isWhatsappVerified: false,
      emergencyPhone: "+256 773 003214",
      locationText: "Kampala, Uganda",
      timezone: "Africa/Kampala",
      defaultSeoTitle: "Dr. Dental Crest Dental Surgery | Trusted Dental Care in Kampala",
      defaultSeoDescription: "Dr. Dental Crest Dental Surgery provides professional general, cosmetic, restorative, orthodontic, and family dental care in Kampala. Request an appointment today.",
      ratingEnabled: false, // Disabled by default per business rules
      ratingValue: 5.0,
      ratingLabel: "Rated 5.0 by our patients",
      bookingSettings: JSON.stringify({
        manualConfirmation: true,
        bufferMinutes: 15,
        leadTimeHours: 2,
        maxAdvanceDays: 60,
      }),
      notificationSettings: JSON.stringify({
        emailEnabled: true,
        smsEnabled: false,
        whatsappEnabled: false,
      }),
      socialLinks: JSON.stringify({}),
    },
  });

  console.log("Seeding Operating Hours (with Friday marked as draft / unverified)...");
  // 0: Sunday, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  const hoursData = [
    { dayOfWeek: 1, startTime: "08:00", endTime: "20:00", isAvailable: true, isVerified: true },
    { dayOfWeek: 2, startTime: "08:00", endTime: "20:00", isAvailable: true, isVerified: true },
    { dayOfWeek: 3, startTime: "08:00", endTime: "20:00", isAvailable: true, isVerified: true },
    { dayOfWeek: 4, startTime: "08:00", endTime: "20:00", isAvailable: true, isVerified: true },
    // Friday: unusual 8:00–8:30 AM requires admin confirmation. Locked from public live booking!
    { dayOfWeek: 5, startTime: "08:00", endTime: "08:30", isAvailable: false, isVerified: false },
    { dayOfWeek: 6, startTime: "08:00", endTime: "20:00", isAvailable: true, isVerified: true },
    { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isAvailable: true, isVerified: true },
  ];

  for (const h of hoursData) {
    await prisma.workingHours.create({
      data: {
        locationId: location.id,
        dayOfWeek: h.dayOfWeek,
        startTime: h.startTime,
        endTime: h.endTime,
        isAvailable: h.isAvailable,
        isVerified: h.isVerified,
      },
    });
  }

  console.log("Seeding Staff Users...");
  const adminPassword = await bcrypt.hash("AdminPass2026!", 10);
  const receptionistPassword = await bcrypt.hash("ReceptPass2026!", 10);
  const dentistPassword = await bcrypt.hash("SilverDentist2026!", 10);

  const adminUser = await prisma.user.create({
    data: {
      firstName: "Clinic",
      lastName: "Administrator",
      email: "admin@crestdentalsurgery.com",
      phone: "+256 773 003214",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  });

  const receptionistUser = await prisma.user.create({
    data: {
      firstName: "Front",
      lastName: "Desk",
      email: "receptionist@crestdentalsurgery.com",
      phone: "+256 773 003214",
      passwordHash: receptionistPassword,
      role: Role.RECEPTIONIST,
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  });

  const silverUser = await prisma.user.create({
    data: {
      firstName: "Dr.",
      lastName: "Silver",
      email: "dr.silver@crestdentalsurgery.com",
      phone: "+256 773 003214",
      passwordHash: dentistPassword,
      role: Role.DENTIST,
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  });

  const silverProfile = await prisma.dentistProfile.create({
    data: {
      userId: silverUser.id,
      professionalTitle: "Lead Dental Surgeon",
      specialties: "General Dentistry, Cosmetic Care, Orthodontics, Implants, Children's Dentistry",
      // Crucial: Qualifications, degrees, years of experience remain blank until verified by clinic admin
      qualifications: null,
      biography: "Dr. Silver leads the dental care team at Dr. Dental Crest Dental Surgery in Kampala, committed to attentive, individualized oral health and smile care for patients of all ages.",
      languages: null,
      yearsExperience: null,
      displayOrder: 1,
      isBookable: true,
    },
  });

  console.log("Seeding Services (Zero price fields!)...");
  const servicesData = [
    {
      name: "General Dentistry & Check-Ups",
      slug: "general-dentistry-checkups",
      category: "General",
      shortDescription: "Routine dental evaluations, gentle cleanings, cavity prevention, and comprehensive oral health maintenance for long-term dental wellness.",
      fullDescription: "Our general dentistry consultations provide meticulous assessments of teeth, gums, and soft tissues. We focus on proactive oral health, early detection, and gentle care tailored to every patient's comfort in Kampala.",
      benefits: JSON.stringify([
        "Comprehensive oral health and gum tissue assessment",
        "Gentle, thorough dental cleaning and plaque removal",
        "Early detection of tooth decay and dental concerns",
        "Personalized daily home-care guidance",
      ]),
      treatmentProcess: JSON.stringify([
        { step: "Initial Consultation", desc: "Discussion of oral health history and any discomfort or goals." },
        { step: "Clinical Examination", desc: "Detailed evaluation of teeth, gums, and oral structures." },
        { step: "Hygiene & Care", desc: "Professional cleaning and preventive maintenance recommendations." },
        { step: "Ongoing Care Plan", desc: "Guidance on recall frequency and tailored home hygiene tips." },
      ]),
      faqContent: JSON.stringify([
        { q: "How often should I schedule a check-up?", a: "Most adults and children benefit from a routine assessment every six months." },
        { q: "Is the routine evaluation painful?", a: "Our clinic prioritizes gentle, patient-centered techniques to ensure comfort." },
      ]),
      durationMinutes: 45,
      bufferMinutes: 15,
      seoTitle: "General Dentistry & Dental Check-Ups in Kampala | Dr. Dental Crest",
      seoDescription: "Professional dental check-ups, cleanings, and preventative oral health care at Dr. Dental Crest Dental Surgery in Kampala. Request an appointment.",
    },
    {
      name: "Cosmetic Dentistry & Veneers",
      slug: "cosmetic-dentistry-veneers",
      category: "Cosmetic",
      shortDescription: "Custom smile enhancements, aesthetic veneer consultations, tooth contouring, and subtle refinements tailored to your natural features.",
      fullDescription: "Cosmetic dentistry at Dr. Dental Crest focuses on creating harmonious, confident smiles. Whether you are interested in veneers or aesthetic adjustments, Dr. Silver assesses your smile aesthetics with care and precision.",
      benefits: JSON.stringify([
        "Tailored smile assessments aligned with your facial aesthetics",
        "Modern veneer consultations for chip, gap, or shade refinement",
        "Conservative approaches that preserve natural tooth structure",
        "Natural-looking results designed for lasting confidence",
      ]),
      treatmentProcess: JSON.stringify([
        { step: "Aesthetic Evaluation", desc: "Detailed discussion of your smile goals and facial symmetry." },
        { step: "Treatment Planning", desc: "Customized aesthetic mapping and shade selection." },
        { step: "Preparation & Fitting", desc: "Careful preparation and bespoke placement of cosmetic restorations." },
        { step: "Final Review", desc: "Assessment of bite, comfort, and natural aesthetic finish." },
      ]),
      faqContent: JSON.stringify([
        { q: "What are dental veneers?", a: "Veneers are thin, custom-crafted shells designed to cover the front surface of teeth to improve appearance." },
        { q: "How do I know if cosmetic care is right for me?", a: "A personalized consultation helps evaluate your dental health and aesthetic objectives." },
      ]),
      durationMinutes: 60,
      bufferMinutes: 15,
      seoTitle: "Cosmetic Dentistry & Veneers in Kampala | Dr. Dental Crest",
      seoDescription: "Aesthetic dental care and veneer consultations in Kampala. Enhance your smile with personalized treatments at Dr. Dental Crest Dental Surgery.",
    },
    {
      name: "Dental Implants & Prosthetics",
      slug: "dental-implants-prosthetics",
      category: "Restorative",
      shortDescription: "Consultations and planning for tooth replacement solutions, crown restorations, bridges, and durable prosthetics.",
      fullDescription: "Restore function, chewing comfort, and smile completeness with restorative dental solutions. Our team evaluates your bone support, gum health, and bite to formulate an individualized restorative plan.",
      benefits: JSON.stringify([
        "Comprehensive replacement planning for single or multiple missing teeth",
        "Restoration of natural chewing function and speech clarity",
        "Preservation of surrounding facial and jaw structure",
        "Durable, custom-crafted prosthetic solutions",
      ]),
      treatmentProcess: JSON.stringify([
        { step: "Clinical & Bone Assessment", desc: "Detailed assessment of oral anatomy and bone readiness." },
        { step: "Restorative Roadmap", desc: "Formulation of an individualized prosthetic and surgical sequence." },
        { step: "Precision Placement", desc: "Meticulous restorative placement and integration phase." },
        { step: "Long-term Maintenance", desc: "Scheduled reviews to ensure stability and prosthetic longevity." },
      ]),
      faqContent: JSON.stringify([
        { q: "Who is a candidate for dental implants?", a: "Adults with healthy gums and adequate jawbone support are typically suitable candidates." },
        { q: "How long do restorative prosthetics last?", a: "With diligent oral hygiene and regular check-ups, prosthetics offer long-term durability." },
      ]),
      durationMinutes: 60,
      bufferMinutes: 15,
      seoTitle: "Dental Implants & Prosthetics in Kampala | Dr. Dental Crest",
      seoDescription: "Consultations for missing tooth replacement, crowns, bridges, and dental implants at Dr. Dental Crest Dental Surgery in Kampala.",
    },
    {
      name: "Children’s Dentistry",
      slug: "childrens-dentistry",
      category: "Pediatric",
      shortDescription: "Gentle, compassionate pediatric dental visits that foster positive oral hygiene habits and lifelong healthy smiles.",
      fullDescription: "We provide a calm, reassuring clinic atmosphere for infants, children, and teenagers. Our focus is on making dental visits enjoyable while monitoring dental development, preventing cavities, and educating young patients.",
      benefits: JSON.stringify([
        "Warm, patient-first approach designed to minimize young patient anxiety",
        "Early cavity prevention, fissure sealants, and fluoride guidance",
        "Monitoring of dental eruption, bite development, and spacing",
        "Empowering parents and children with fun, effective brushing habits",
      ]),
      treatmentProcess: JSON.stringify([
        { step: "Friendly Welcome", desc: "Helping your child feel comfortable and safe in the dental chair." },
        { step: "Gentle Examination", desc: "Careful check of developing teeth, gums, and oral milestones." },
        { step: "Preventive Care", desc: "Gentle cleaning and protective recommendations where appropriate." },
        { step: "Parent Coaching", desc: "Supportive advice on diet, snacking habits, and home hygiene routines." },
      ]),
      faqContent: JSON.stringify([
        { q: "At what age should a child first visit the dentist?", a: "We recommend scheduling a first dental visit by their first birthday or when their first tooth appears." },
        { q: "How can I prepare my child for their visit?", a: "Keep explanations simple, positive, and reassuring without using fear-inducing words." },
      ]),
      durationMinutes: 30,
      bufferMinutes: 15,
      seoTitle: "Children's Dentistry in Kampala | Gentle Pediatric Dental Care",
      seoDescription: "Compassionate, gentle dental care for children and teens in Kampala. Friendly visits and preventive check-ups at Dr. Dental Crest Dental Surgery.",
    },
    {
      name: "Orthodontics",
      slug: "orthodontics",
      category: "Orthodontics",
      shortDescription: "Assessments for teeth alignment, bite correction, spacing issues, and guidance toward balanced dental harmony.",
      fullDescription: "Orthodontic evaluations assess dental crowding, gaps, overbites, and alignment concerns. Dr. Silver provides consultations to outline appropriate alignment paths for both adolescents and adults.",
      benefits: JSON.stringify([
        "Detailed alignment and bite relationship analysis",
        "Improvement in chewing efficiency and speech balance",
        "Easier plaque removal and reduced wear on misaligned teeth",
        "Enhancement of smile symmetry and facial balance",
      ]),
      treatmentProcess: JSON.stringify([
        { step: "Orthodontic Assessment", desc: "Evaluation of dental arches, tooth alignment, and bite harmony." },
        { step: "Diagnostic Analysis", desc: "Detailed review of facial profile and tooth positions." },
        { step: "Options Consultation", desc: "Discussion of suitable alignment solutions and estimated timelines." },
        { step: "Progressive Alignment", desc: "Periodic adjustment visits and attentive progress tracking." },
      ]),
      faqContent: JSON.stringify([
        { q: "Can adults receive orthodontic consultations?", a: "Yes, orthodontic assessments are suitable for patients of any age with healthy gums and bone support." },
        { q: "How long does orthodontic alignment usually take?", a: "Duration varies significantly depending on individual alignment complexity." },
      ]),
      durationMinutes: 45,
      bufferMinutes: 15,
      seoTitle: "Orthodontic Consultations in Kampala | Dr. Dental Crest Dental Surgery",
      seoDescription: "Teeth alignment assessments and orthodontic consultations in Kampala. Discover options for your smile with Dr. Silver.",
    },
  ];

  for (const s of servicesData) {
    const createdService = await prisma.service.create({
      data: s,
    });
    // Link Dr. Silver to each service
    await prisma.dentistService.create({
      data: {
        dentistId: silverProfile.id,
        serviceId: createdService.id,
      },
    });
  }

  console.log("Seeding FAQs (6 clinic non-medical questions)...");
  const faqsData = [
    {
      category: "Appointments",
      question: "How do I request an appointment?",
      answer: "You can submit an appointment request through our website or call the clinic. Our team will contact you to confirm an available time.",
      displayOrder: 1,
    },
    {
      category: "Appointments",
      question: "Do I need an account to request an appointment?",
      answer: "No. You can request an appointment as a guest without creating an account.",
      displayOrder: 2,
    },
    {
      category: "Appointments",
      question: "Will my appointment be confirmed immediately?",
      answer: "Appointment requests are reviewed by our clinic team. We will contact you to confirm your appointment time.",
      displayOrder: 3,
    },
    {
      category: "Services",
      question: "Can children receive dental care at the clinic?",
      answer: "Yes. Select Children’s Dentistry when submitting your request and provide the relevant details.",
      displayOrder: 4,
    },
    {
      category: "Clinic Visit",
      question: "What should I bring to my dental appointment?",
      answer: "Our team will let you know if any documents are required when confirming your appointment. Please contact the clinic if you have questions before your visit.",
      displayOrder: 5,
    },
    {
      category: "Contact",
      question: "How can I contact the clinic?",
      answer: "You can call Dr. Dental Crest Dental Surgery at +256 773 003214 or use the contact and appointment-request forms on this website.",
      displayOrder: 6,
    },
  ];

  for (const f of faqsData) {
    await prisma.faq.create({
      data: {
        ...f,
        isPublished: true,
      },
    });
  }

  console.log("Seeding Blog Categories & 6 Draft Articles...");
  const generalCat = await prisma.blogCategory.create({
    data: { name: "Oral Health Advice", slug: "oral-health-advice" },
  });
  const pedCat = await prisma.blogCategory.create({
    data: { name: "Family Dentistry", slug: "family-dentistry" },
  });
  const orthoCat = await prisma.blogCategory.create({
    data: { name: "Orthodontics & Smiles", slug: "orthodontics-smiles" },
  });

  const blogPostsData = [
    {
      title: "How Often Should You Schedule a Dental Check-Up?",
      slug: "how-often-should-you-schedule-a-dental-check-up",
      categoryId: generalCat.id,
      excerpt: "Understanding the importance of routine dental check-ups and how preventive visits safeguard your oral health in Kampala.",
      content: `## The Importance of Routine Preventive Care

Maintaining a healthy smile requires more than daily brushing and flossing at home. Regular dental check-ups provide an opportunity for professional evaluation, early identification of potential oral concerns, and personalized hygiene advice.

### Why Six Months is a Common Guideline
For most adults and children, scheduling a visit every six months ensures that plaque and tartar build-up are addressed before they contribute to gum irritation or enamel erosion. 

### What Happens During a Preventive Evaluation?
During a routine consultation at Dr. Dental Crest Dental Surgery:
1. **Visual Inspection**: We carefully review the surfaces of your teeth and gums.
2. **Soft Tissue Health**: We inspect your tongue, palate, and cheek linings.
3. **Gentle Cleaning**: Hardened deposits are gently cleared.
4. **Care Guidance**: We discuss personalized home hygiene tips.

If it has been some time since your last dental visit, our team in Kampala is here to welcome you.`,
      status: PostStatus.DRAFT,
      seoTitle: "How Often Should You Schedule a Dental Check-Up? | Dr. Dental Crest",
      seoDescription: "Learn why routine preventive dental check-ups are essential for lasting oral wellness in Kampala.",
    },
    {
      title: "Simple Daily Habits for Better Oral Health",
      slug: "simple-daily-habits-for-better-oral-health",
      categoryId: generalCat.id,
      excerpt: "Small, consistent daily practices that keep your teeth and gums strong between clinic visits.",
      content: `## Building a Foundation of Consistent Daily Habits

A radiant, healthy smile begins with the small routines you practice morning and evening. Simple habits can significantly reduce the risk of common dental concerns.

### 1. Brush Thoroughly Twice Daily
Use a soft-bristled toothbrush and fluoride toothpaste. Take two full minutes, ensuring all tooth surfaces—outer, inner, and chewing surfaces—are cleaned gently.

### 2. Floss Daily
Brushing reaches only part of tooth surfaces. Daily flossing removes food debris and plaque from tight spaces between teeth where gum issues often initiate.

### 3. Rinse with Water After Meals
Rinsing with plain water after eating helps neutralize acids and wash away residual food particles.

### 4. Stay Hydrated
Saliva is the mouth's natural defense against acid. Drinking plenty of water throughout the day stimulates saliva production and protects tooth enamel.`,
      status: PostStatus.DRAFT,
      seoTitle: "Simple Daily Habits for Better Oral Health | Dental Advice",
      seoDescription: "Practical everyday habits for stronger teeth and healthier gums from Dr. Dental Crest Dental Surgery.",
    },
    {
      title: "What to Expect During a Dental Consultation",
      slug: "what-to-expect-during-a-dental-consultation",
      categoryId: generalCat.id,
      excerpt: "A calm, step-by-step overview of your first visit to Dr. Dental Crest Dental Surgery in Kampala.",
      content: `## A Welcoming, Patient-Centered Consultation

Visiting a dental clinic should be a reassuring and transparent experience. At Dr. Dental Crest Dental Surgery in Kampala, led by Dr. Silver, every consultation is designed around patient comfort and clear communication.

### Step 1: Listening to Your Priorities
We begin by discussing your oral health history, any current sensitivities or discomfort, and what you hope to achieve during your visit.

### Step 2: Thorough Clinical Assessment
Our team conducts a comprehensive examination of your teeth, bite, and gum tissues. We take time to explain our findings clearly.

### Step 3: Collaborative Discussion
If any treatments or preventive adjustments are recommended, we outline the options and answer all of your questions, empowering you to make informed decisions.`,
      status: PostStatus.DRAFT,
      seoTitle: "What to Expect During a Dental Consultation | Kampala",
      seoDescription: "Step-by-step walkthrough of what to expect during your dental consultation at Dr. Dental Crest Dental Surgery.",
    },
    {
      title: "Caring for Children’s Teeth at Home",
      slug: "caring-for-childrens-teeth-at-home",
      categoryId: pedCat.id,
      excerpt: "Helpful guidance for parents on instilling positive, stress-free dental care routines for young children.",
      content: `## Nurturing Lifelong Healthy Habits

Starting positive oral hygiene early builds children's confidence and protects developing primary and permanent teeth.

### Making Brushing Engaging
- Use age-appropriate brushes with soft bristles.
- Play a two-minute song or set a fun timer to encourage brushing for the recommended duration.
- Brush together as a family to model proper technique.

### Protecting Young Enamel
Limit frequent consumption of sugary snacks and juices between meals. Encourage plain water as the primary beverage, especially before bedtime.

### Early Dental Introductions
Introducing your child to the dental clinic in a friendly, gentle environment helps prevent dental anxiety and establishes a positive foundation.`,
      status: PostStatus.DRAFT,
      seoTitle: "Caring for Children's Teeth at Home | Pediatric Oral Health",
      seoDescription: "Tips and advice for parents on caring for children's teeth and building healthy brushing routines.",
    },
    {
      title: "Understanding Orthodontic Consultations",
      slug: "understanding-orthodontic-consultations",
      categoryId: orthoCat.id,
      excerpt: "What an orthodontic assessment entails and how tooth alignment supports both function and smile harmony.",
      content: `## The Purpose of an Orthodontic Assessment

Orthodontic consultations are about much more than appearance—proper tooth alignment directly impacts chewing efficiency, jaw comfort, and speech clarity.

### Who Benefits from an Evaluation?
- Individuals experiencing crowded or overlapping teeth
- Patients with noticeable spacing or gaps
- People with bite discrepancies such as overbites or crossbites
- Adults wishing to improve tooth positioning

### What Happens in the Consultation?
During your assessment at Dr. Dental Crest Dental Surgery, we evaluate your facial aesthetics, jaw alignment, and tooth positions to determine whether alignment therapy would benefit your long-term oral health.`,
      status: PostStatus.DRAFT,
      seoTitle: "Understanding Orthodontic Consultations | Kampala Smiles",
      seoDescription: "Learn what happens during an orthodontic consultation and how teeth alignment benefits oral health.",
    },
    {
      title: "Cosmetic Dentistry: Questions to Ask During Your Consultation",
      slug: "cosmetic-dentistry-questions-to-ask-during-your-consultation",
      categoryId: orthoCat.id,
      excerpt: "Thoughtful questions to help you understand your cosmetic smile enhancement options.",
      content: `## Preparing for a Smile Consultation

Cosmetic dentistry offers a variety of ways to refine and revitalize your smile. Asking the right questions ensures your expectations align with clinical recommendations.

### Key Questions to Consider:
1. **What options are most suitable for my smile goals?** (e.g., veneers, composite bonding, or contouring)
2. **How does this treatment preserve my natural tooth structure?**
3. **What does the consultation and fitting process look like?**
4. **How do I maintain my results over the years?**

Dr. Silver and the team at Dr. Dental Crest Dental Surgery prioritize conservative, natural-looking results tailored to your unique smile.`,
      status: PostStatus.DRAFT,
      seoTitle: "Cosmetic Dentistry: Questions to Ask | Dr. Dental Crest",
      seoDescription: "Important questions to discuss during your cosmetic dentistry consultation in Kampala.",
    },
  ];

  for (const p of blogPostsData) {
    await prisma.blogPost.create({
      data: {
        ...p,
        authorId: adminUser.id,
      },
    });
  }

  console.log("Seeding Sample Clients & Appointment Requests (with mixed lifecycle statuses)...");
  const client1 = await prisma.client.create({
    data: {
      fullName: "Grace Nabakooza",
      phone: "+256 701 234567",
      email: "grace.nabakooza@example.com",
      isReturningPatient: false,
      preferredCommunicationMethod: "phone",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      fullName: "David Mukasa",
      phone: "+256 782 987654",
      email: "david.mukasa@example.com",
      isReturningPatient: true,
      preferredCommunicationMethod: "phone",
    },
  });

  const generalService = await prisma.service.findUnique({
    where: { slug: "general-dentistry-checkups" },
  });

  const cosmeticService = await prisma.service.findUnique({
    where: { slug: "cosmetic-dentistry-veneers" },
  });

  if (generalService) {
    await prisma.appointmentRequest.create({
      data: {
        referenceNumber: "DDC-2026-000001",
        clientId: client1.id,
        serviceId: generalService.id,
        preferredDentistId: silverProfile.id,
        assignedDentistId: silverProfile.id,
        locationId: location.id,
        preferredDate: "2026-09-22",
        preferredTime: "10:00",
        status: AppointmentStatus.PENDING,
        source: BookingSource.WEBSITE,
        clientMessage: "Requesting a routine dental check-up and cleaning in the morning.",
        internalNote: "Guest request received via website. Ready for receptionist phone call to confirm.",
      },
    });
  }

  if (cosmeticService) {
    await prisma.appointmentRequest.create({
      data: {
        referenceNumber: "DDC-2026-000002",
        clientId: client2.id,
        serviceId: cosmeticService.id,
        preferredDentistId: silverProfile.id,
        assignedDentistId: silverProfile.id,
        locationId: location.id,
        preferredDate: "2026-09-23",
        preferredTime: "14:00",
        status: AppointmentStatus.CONFIRMED,
        source: BookingSource.PHONE,
        clientMessage: "Consultation regarding veneer options.",
        internalNote: "Confirmed via phone call with patient.",
      },
    });
  }

  console.log("Seeding Sample Contact Inquiries...");
  await prisma.contactInquiry.create({
    data: {
      name: "Arthur Kato",
      email: "arthur.kato@example.com",
      phone: "+256 752 112233",
      subject: "Directions to clinic in Kampala",
      message: "Hello, could you provide directions from Kololo to your clinic? Thank you.",
      status: InquiryStatus.OPEN,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
