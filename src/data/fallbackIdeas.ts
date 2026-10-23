import type { EventType, Ideas } from "@/types/plan";

export const FALLBACK_IDEAS: Record<EventType, Ideas> = {
  wedding: {
    themes: [
      { title: "Marigold Mehfil", description: "Warm marigold, mogra and brass for a classic North-Indian feel." },
      { title: "Pastel Garden", description: "Blush, sage and fairy lights for a soft daytime ceremony." },
      { title: "Royal Rajputana", description: "Deep reds, jharokha backdrops and ornate lanterns." },
    ],
    decor: ["Floral mandap with hanging genda strings", "Photo booth with jharokha frames", "Diya-lined aisle", "Personalised welcome signage"],
    menu: ["Live chaat counter", "Regional thali station", "Paneer tikka and kebab grill", "Kulfi and paan bar"],
    activities: ["Sangeet dance-off between families", "Couple trivia quiz", "Mehendi with folk musicians"],
    gifts: ["Mini mithai boxes", "Seed-paper thank-you cards", "Brass diyas"],
    playlistVibes: ["Bollywood wedding classics", "Sufi evenings", "Punjabi dhol beats"],
    tips: ["Book the caterer before decor; it's the biggest spend", "Keep 5% aside for last-minute surprises", "Share a day-of timeline with every vendor"],
  },
  birthday: {
    themes: [
      { title: "Retro Disco", description: "Mirror balls, neon and a 70s-80s playlist." },
      { title: "Garden Picnic", description: "Daytime picnic rugs, lemonade and fairy lights." },
      { title: "Movie Night", description: "Popcorn bar, projector and favourite-film costumes." },
    ],
    decor: ["Balloon arch in the theme colours", "Memory wall with photos through the years", "Custom name neon sign"],
    menu: ["Mini sliders and pav bhaji", "Pasta live station", "DIY cupcake bar"],
    activities: ["Treasure hunt", "Karaoke corner", "Polaroid guestbook"],
    gifts: ["Personalised keychains", "Mini plant pots", "Candy jars"],
    playlistVibes: ["Feel-good pop", "Throwback hits", "Indie Bollywood"],
    tips: ["Confirm the cake 7 days ahead", "Plan for 10% extra guests at the buffet", "Keep return gifts at the exit"],
  },
  festival: {
    themes: [
      { title: "Festival of Lights", description: "Diyas, lanterns and rangoli for a glowing evening." },
      { title: "Colours of Togetherness", description: "Bright traditional hues and community music." },
      { title: "Heritage Night", description: "Regional crafts, attire and cuisine celebrated together." },
    ],
    decor: ["Rangoli or kolam at the entrance", "String lights and paper lanterns", "Flower torans on doorways"],
    menu: ["Festive sweets platter", "Regional festive specials", "Masala chai and snacks counter"],
    activities: ["Rangoli competition", "Traditional attire contest", "Storytelling about the festival's significance"],
    gifts: ["Sweet hampers", "Dry-fruit boxes", "Handmade diyas or ornaments"],
    playlistVibes: ["Devotional and folk", "Festive Bollywood", "Instrumental classical"],
    tips: ["Respect rituals and timings of the occasion", "Use eco-friendly decor and colours", "Keep a safety plan for diyas and lamps"],
  },
  corporate: {
    themes: [
      { title: "Celebrate the Wins", description: "Brand colours, highlight reels and team shout-outs." },
      { title: "Unplugged Offsite", description: "Outdoor games, nature and phone-free time." },
      { title: "Global Café", description: "Food and music from where the team comes from." },
    ],
    decor: ["Branded backdrop for photos", "Team milestone timeline wall", "Table cards with team trivia"],
    menu: ["Inclusive buffet with clearly labelled veg/Jain/vegan options", "Live counters to reduce queues", "Mocktail bar"],
    activities: ["Cross-team quiz", "Recognition awards", "Collaborative art wall"],
    gifts: ["Branded bottles or notebooks", "Plantable pens", "E-gift vouchers"],
    playlistVibes: ["Upbeat instrumental", "Light pop", "Inclusive multilingual hits"],
    tips: ["Get approvals and budget sign-off early", "Send calendar invites with clear agenda", "Test AV a day before"],
  },
  community: {
    themes: [
      { title: "Neighbourhood Mela", description: "Food stalls, games and local performers." },
      { title: "Green Day", description: "Plantation drive, swaps and zero-waste stalls." },
      { title: "Talent Evening", description: "Stage for residents of every age." },
    ],
    decor: ["Bunting and banners", "Stage backdrop with community name", "Clear signage for zones"],
    menu: ["Local street-food stalls", "Potluck table", "Water and juice stations"],
    activities: ["Kids' games corner", "Open mic", "Lucky draw"],
    gifts: ["Saplings", "Participation certificates", "Cloth bags"],
    playlistVibes: ["Folk and regional", "Retro Bollywood", "Family-friendly pop"],
    tips: ["Apply for permits early", "Brief volunteers with a run-sheet", "Plan first-aid and crowd flow"],
  },
};
