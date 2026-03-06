/**
 * Simulates enterprise API output for Alison, edX, and TESDA Online Program.
 * This mocked backend guarantees consistent, normalized schemas simulating 
 * actual technical-vocational MOOC course JSON responses.
 */

const mockCourses = [
    {
        id: "alison_hw_01",
        title: "Diploma in Caregiving",
        provider: "Alison",
        duration: "10-15 Hours",
        hasCertificate: true,
        isFree: true,
        applyLink: "https://alison.com/course/diploma-in-caregiving",
        skills: ["Caregiving", "Health Aide", "NC II Relevant", "Geriatric Care"],
        image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "alison_it_02",
        title: "Introduction to Computer Networking",
        provider: "Alison",
        duration: "3-4 Hours",
        hasCertificate: true,
        isFree: true,
        applyLink: "https://alison.com",
        skills: ["Computer Systems Servicing NC II", "Networking", "IT"],
        image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "edx_cs_50",
        title: "CS50's Introduction to Computer Science",
        provider: "edX",
        duration: "12 Weeks",
        hasCertificate: true,
        isFree: true,
        applyLink: "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x",
        skills: ["Programming NC IV", "C", "Python", "SQL"],
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "edx_lang_01",
        title: "Basic Japanese for Professionals",
        provider: "edX",
        duration: "4 Weeks",
        hasCertificate: true,
        isFree: true,
        applyLink: "https://www.edx.org",
        skills: ["Japanese Language", "JLPT N5 Prep", "Communication"],
        image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "top_agri_01",
        title: "Agro-entrepreneurship NC II",
        provider: "TESDA Online Program",
        duration: "Self-paced",
        hasCertificate: true,
        isFree: true,
        applyLink: "https://e-tesda.gov.ph",
        skills: ["Agriculture", "Entrepreneurship", "NC II Required"],
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "top_baking_02",
        title: "Bread and Pastry Production NC II",
        provider: "TESDA Online Program",
        duration: "Self-paced",
        hasCertificate: true,
        isFree: true,
        applyLink: "https://e-tesda.gov.ph",
        skills: ["Baking", "Food Service", "NC II Required"],
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "top_welding_03",
        title: "Shielded Metal Arc Welding (SMAW) NC II",
        provider: "TESDA Online Program",
        duration: "Self-paced",
        hasCertificate: true,
        isFree: true,
        applyLink: "https://e-tesda.gov.ph",
        skills: ["Welding", "Industrial", "NC II Required", "SMAW"],
        image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "edx_bus_02",
        title: "Entrepreneurship in Emerging Economies",
        provider: "edX",
        duration: "6 Weeks",
        hasCertificate: true,
        isFree: true,
        applyLink: "https://www.edx.org",
        skills: ["Business Analysis", "Strategy", "Management"],
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "alison_mech_03",
        title: "Fundamentals of Automotive Mechanics",
        provider: "Alison",
        duration: "2-3 Hours",
        hasCertificate: true,
        isFree: true,
        applyLink: "https://alison.com",
        skills: ["Automotive Servicing NC II", "Mechanics", "Maintenance"],
        image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
];

export const getSimulatedCourses = async () => {
    let apiCourses = [];
    try {
        const response = await fetch('https://free-courses-online-api.p.rapidapi.com/courses', {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'free-courses-online-api.p.rapidapi.com',
                'x-rapidapi-key': '9f06a5303dmsh17daecb33f7760bp1f227djsnd697e9813777'
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Map the external API schema to our unified mock schema
            apiCourses = data.map((item, index) => ({
                id: `rapidapi_free_${index}`,
                title: item.title || item.name || "Specialized Online Course",
                provider: "Free Courses Online",
                duration: "Self-paced",
                hasCertificate: true,
                isFree: true,
                applyLink: item.url || item.link || "https://www.classcentral.com",
                skills: ["Online Certification", "Upskilling"],
                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            }));
        } else {
            console.warn('RapidAPI Free Courses responded with non-200 status. Falling back to robust mock catalog.');
            throw new Error('Non-200 response');
        }
    } catch (error) {
        console.warn('RapidAPI Free Courses fetch failed. Falling back to robust mock catalog.', error.message);

        // Premium fallback data specifically for 'Free Courses Online'
        apiCourses = [
            {
                id: "free_api_mock_01",
                title: "Complete Python Web Developer Bootcamp",
                provider: "Free Courses Online",
                duration: "40 Hours",
                hasCertificate: true,
                isFree: true,
                applyLink: "https://www.classcentral.com",
                skills: ["Python", "Django", "Web Development"],
                image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            },
            {
                id: "free_api_mock_02",
                title: "Digital Marketing Masterclass",
                provider: "Free Courses Online",
                duration: "15 Hours",
                hasCertificate: true,
                isFree: true,
                applyLink: "https://www.classcentral.com",
                skills: ["SEO", "Social Media", "Marketing", "Analytics"],
                image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            },
            {
                id: "free_api_mock_03",
                title: "Data Science A-Z: Real-Life Exercises Included",
                provider: "Free Courses Online",
                duration: "21 Hours",
                hasCertificate: true,
                isFree: true,
                applyLink: "https://www.classcentral.com",
                skills: ["Data Science", "Machine Learning", "R", "Tableau"],
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            },
            {
                id: "free_api_mock_04",
                title: "Graphic Design Masterclass",
                provider: "Free Courses Online",
                duration: "26 Hours",
                hasCertificate: true,
                isFree: true,
                applyLink: "https://www.classcentral.com",
                skills: ["Photoshop", "Illustrator", "Design Theory"],
                image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            },
            {
                id: "free_api_mock_05",
                title: "The Complete Public Speaking Course",
                provider: "Free Courses Online",
                duration: "6 Hours",
                hasCertificate: true,
                isFree: true,
                applyLink: "https://www.classcentral.com",
                skills: ["Communication", "Leadership", "Presentation"],
                image: "https://images.unsplash.com/photo-1475721025505-c31bc16834de?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            }
        ];
    }

    // Merge API results with our curated mocks, prioritizing API if available
    return [...apiCourses, ...mockCourses];
};
