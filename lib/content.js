/* =========================================================
   Rutu-Maa — static content & knowledge base
   (educational content only, not medical advice)
   ========================================================= */
export const RM_CONTENT = {

  /* ---------------- PCOD / PCOS corner ---------------- */
  pcod: {
    what: "PCOD (Polycystic Ovarian Disease) / PCOS is a common hormonal condition where the ovaries produce many immature or partially mature eggs that can turn into cysts. It is linked with higher androgen (male hormone) levels and often insulin resistance. It is very manageable with the right lifestyle, nutrition and care.",
    prevalence: "Affects roughly 1 in 5 women of reproductive age in India.",
    symptoms: [
      "Irregular, delayed or missed periods",
      "Heavy or unusually light bleeding",
      "Acne, oily skin and excess facial/body hair (hirsutism)",
      "Unexpected weight gain, especially around the belly",
      "Hair thinning or scalp hair loss",
      "Dark patches of skin (neck, underarms)",
      "Mood swings, low energy and trouble sleeping",
      "Difficulty getting pregnant"
    ],
    selfCheckIntro: "A quick self-reflection — this is NOT a diagnosis. If several apply to you, please consult a gynaecologist.",
    selfCheck: [
      "My periods are often irregular (cycle longer than 35 days or fewer than 8 periods a year)",
      "I have noticeable acne or excess hair growth",
      "I have gained weight without a clear reason",
      "I often feel very tired or have sugar cravings",
      "I have a family history of PCOD/PCOS or diabetes"
    ],
    careTips: [
      "Move daily — even a 30-minute brisk walk improves insulin sensitivity",
      "Prefer low glycaemic index (GI) foods to keep blood sugar steady",
      "Strength training 2–3x a week helps hormones and metabolism",
      "Sleep 7–8 hours; poor sleep worsens insulin resistance",
      "Manage stress with breathing, yoga or journaling — cortisol affects cycles",
      "Stay hydrated and limit sugary drinks & ultra-processed snacks",
      "Track your cycle so you can share patterns with your doctor",
      "Don't crash diet — gentle, consistent changes work best for PCOD"
    ],
    hygieneTips: [
      "Change pads/tampons every 3–4 hours even on lighter PCOD flow days",
      "Irregular cycles mean spotting can surprise you — keep a backup pad always",
      "Use gentle, fragrance-free intimate wash; avoid harsh soaps inside",
      "Keep the area dry to prevent fungal infections (more common with insulin resistance)",
      "Wear breathable cotton underwear and change daily",
      "Wipe front to back, always"
    ],
    eatMore: ["Leafy greens & cruciferous veg", "Whole grains (oats, millets, brown rice)", "Lean protein (eggs, fish, paneer, legumes)", "Berries & low-sugar fruit", "Flax & pumpkin seeds", "Cinnamon & spearmint tea", "Healthy fats (nuts, olive oil)"],
    eatLess: ["Refined sugar & sweets", "White bread, maida, sugary cereals", "Deep-fried & fast food", "Sugary drinks & packaged juices", "Excess dairy (if it flares you)", "Too much caffeine"],
    whenDoctor: "See a doctor if periods stop for 3+ months, bleeding is very heavy, you have severe pain, rapid hair loss, or you are trying to conceive without success. Untreated PCOD can affect fertility, blood sugar and heart health — early care makes a big difference."
  },

  /* ---------------- Menstrual hygiene ---------------- */
  hygiene: {
    intro: "Good menstrual hygiene keeps you healthy, comfortable and confident. Small habits prevent infections, rashes and odour.",
    coreTips: [
      "Change your pad every 4–6 hours (every 2–3 hours on heavy days) — never wait longer than 6 hours even on light days.",
      "Wash hands before and after changing your pad or tampon.",
      "Clean the intimate area with plain water front-to-back; avoid scented soaps inside.",
      "Pat dry before wearing a fresh pad — moisture causes rashes and infection.",
      "Wrap used pads in paper and bin them — never flush.",
      "Wear soft cotton underwear and change it daily.",
      "Stay hydrated and eat iron-rich food to handle blood loss.",
      "Track your flow so heavy bleeding doesn't catch you off guard."
    ],
    productCare: [
      { p: "Sanitary pad", t: "Change every 4–6 hrs (2–3 hrs heavy). Most comfortable for beginners." },
      { p: "Tampon", t: "Change every 4–6 hrs. Never leave longer than 8 hrs — risk of TSS." },
      { p: "Menstrual cup", t: "Empty every 8–12 hrs, rinse and reinsert. Sterilise between cycles." },
      { p: "Period underwear", t: "Reusable, rinse and wash. Great backup for light days & PCOD spotting." }
    ],
    essentialsKit: [
      "2–3 pads or tampons (or your cup + pouch)",
      "A spare pair of underwear",
      "Wet wipes / tissue",
      "A small disposal/zip pouch",
      "Pain relief (hot patch or medicine you trust)",
      "A water bottle & a small snack"
    ],
    myths: [
      { m: "You can't exercise on your period.", t: "Gentle movement actually eases cramps and lifts mood." },
      { m: "Period blood is dirty.", t: "It's a normal mix of blood and uterine tissue — completely natural." },
      { m: "You shouldn't wash your hair during periods.", t: "There is no harm — hygiene matters more, not less." }
    ]
  },

  /* ---------------- Food database (for the AI diet engine) ---------------- */
  foods: {
    iron:        ["spinach (palak)", "beetroot", "lentils (dal)", "rajma", "tofu", "dates", "jaggery (gud)", "pumpkin seeds", "chickpeas", "amaranth (rajgira)"],
    vitC:        ["amla", "orange", "lemon water", "guava", "bell pepper", "tomato"],
    lowGI:       ["oats", "millets (bajra, ragi, jowar)", "brown rice", "quinoa", "barley", "whole-wheat roti"],
    leanProtein: ["eggs", "paneer", "grilled fish", "chicken breast", "moong dal", "sprouts", "greek yogurt", "soya chunks"],
    healthyFat:  ["almonds", "walnuts", "flax seeds", "chia seeds", "olive oil", "peanut butter"],
    antiInflam:  ["turmeric milk", "ginger tea", "berries", "green tea", "spearmint tea", "cinnamon"],
    hydration:   ["coconut water", "lemon water", "infused water", "buttermilk (chaas)"],
    comfort:     ["dark chocolate (small)", "banana", "warm soup", "khichdi"]
  },

  /* meal templates — tagged so the engine can pick suitable ones.
     tags: pcod, iron, light, balanced, hydrate */
  meals: {
    breakfast: [
      { name: "Veggie besan chilla + mint chutney", desc: "High protein, low GI — keeps energy steady.", tags: ["pcod", "balanced"] },
      { name: "Ragi porridge with almonds & berries", desc: "Calcium + iron rich, slow-release carbs.", tags: ["pcod", "iron", "balanced"] },
      { name: "Oats with flax, banana & cinnamon", desc: "Fibre + omega-3 for hormone balance.", tags: ["pcod", "balanced"] },
      { name: "2 boiled eggs + multigrain toast + amla shot", desc: "Protein with vitamin-C to boost iron uptake.", tags: ["iron", "balanced"] },
      { name: "Spinach & paneer paratha (less oil) + curd", desc: "Iron + protein — great on heavy-flow mornings.", tags: ["iron", "balanced"] },
      { name: "Poha with peanuts & lots of veggies", desc: "Light, easy to digest, gentle on cramps.", tags: ["light", "balanced"] }
    ],
    midMorning: [
      { name: "Handful of soaked almonds + 1 date", desc: "Iron + healthy fat snack.", tags: ["iron", "pcod"] },
      { name: "Coconut water", desc: "Replenishes minerals lost in bleeding.", tags: ["hydrate", "iron", "light"] },
      { name: "Buttermilk (chaas) with roasted jeera", desc: "Cooling, hydrating, gut-friendly.", tags: ["hydrate", "pcod", "light"] },
      { name: "Guava or orange slices", desc: "Vitamin-C to absorb more iron.", tags: ["iron", "balanced"] }
    ],
    lunch: [
      { name: "Brown rice + dal + sautéed greens + salad", desc: "Balanced low-GI plate with steady energy.", tags: ["pcod", "balanced", "iron"] },
      { name: "2 jowar/bajra roti + rajma + cucumber raita", desc: "High fibre & iron, very PCOD-friendly.", tags: ["pcod", "iron", "balanced"] },
      { name: "Quinoa veg pulao + grilled paneer", desc: "Complete protein, low glycaemic load.", tags: ["pcod", "balanced"] },
      { name: "Roti + palak chicken/soya + beet salad", desc: "Strong iron boost for heavy days.", tags: ["iron", "balanced"] },
      { name: "Khichdi with ghee + curd", desc: "Soothing and light when cramps are bad.", tags: ["light", "balanced"] }
    ],
    evening: [
      { name: "Spearmint or green tea + roasted makhana", desc: "Spearmint may help PCOD androgen balance.", tags: ["pcod", "light"] },
      { name: "Beetroot-carrot juice", desc: "Iron & folate to rebuild energy.", tags: ["iron"] },
      { name: "Fruit chaat with chaat masala", desc: "Light, vitamin-rich pick-me-up.", tags: ["light", "balanced", "hydrate"] },
      { name: "Sprouts bhel with lemon", desc: "Protein + vitamin-C snack.", tags: ["pcod", "iron", "balanced"] }
    ],
    dinner: [
      { name: "Grilled fish/tofu + sautéed veg + millet roti", desc: "Light protein dinner, easy on digestion.", tags: ["pcod", "balanced"] },
      { name: "Moong dal soup + veg stir-fry", desc: "Warm, light and iron-friendly.", tags: ["light", "iron", "pcod"] },
      { name: "Vegetable daliya (broken wheat)", desc: "Fibre-rich, comforting, low GI.", tags: ["pcod", "light", "balanced"] },
      { name: "Palak paneer (less oil) + 1 roti", desc: "Iron + calcium to close a heavy day.", tags: ["iron", "balanced"] }
    ]
  },

  testimonials: [
    { q: "Rutu-Maa reminded me to change my pad every 2 hours on my heaviest days — no more leaks at college.", a: "Aditi, 19" },
    { q: "The PCOD diet plan finally made sense for my body. My energy is so much better.", a: "Sneha, 26" },
    { q: "I love that it tells me 2 days before my period to keep a pad in my bag.", a: "Riya, 22" }
  ]
};
