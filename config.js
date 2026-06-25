// ============================================
// Moonveil SMP Store Configuration
// ============================================
// Copy this file to config.js and update the values
// Then rename it to config.js for the website to use

const storeConfig = {
    // Server Information
    serverName: "Moonveil SMP",
    serverIP: "MoonveilSMP.crazycraftmc.net",
    
    // Rank Prices (USD)
    moonPrice: 30,
    lunarPrice: 20,
    eclipsePrice: 10,
    
    // Misc Prices (USD)
    unbanPrice: 9,
    crateKeyPrice: 5,
    
    // Purchase Links
    moonLink: "https://store.example.com/moon",
    lunarLink: "https://store.example.com/lunar",
    eclipseLink: "https://store.example.com/eclipse",
    unbanLink: "https://store.example.com/unban",
    crateLink: "https://store.example.com/crates",
    
    // Discord Link
    discordLink: "https://discord.gg/example",
    
    // Announcement Banner
    announcementEnabled: true,
    announcementText: "🎉 Welcome to Moonveil SMP Store! Use code WELCOME20 for 20% off!",
    
    // Discount Codes
    // type can be "percentage" or "fixed"
    // value is the percentage (e.g., 20 for 20%) or fixed amount (e.g., 5 for $5 off)
    discounts: {
        "WELCOME20": { type: "percentage", value: 20 },
        "SUMMER10": { type: "percentage", value: 10 },
        "SAVE5": { type: "fixed", value: 5 }
    },
    
    // FAQ Items
    faqItems: [
        {
            question: "How do I receive my rank?",
            answer: "After purchase, your rank will be automatically applied to your account within 5-10 minutes. Make sure you're online in the server for the fastest delivery."
        },
        {
            question: "Can I get a refund?",
            answer: "Refunds are handled on a case-by-case basis. Please contact our support team on Discord with your transaction ID and reason for the refund request."
        },
        {
            question: "Do ranks stack?",
            answer: "Yes! If you purchase a higher rank, you'll keep all perks from lower ranks. For example, purchasing Moon Rank includes all Lunar and Eclipse perks."
        },
        {
            question: "How long do crate keys last?",
            answer: "Crate keys are permanent items in your inventory. They don't expire and can be used whenever you want to open a crate."
        },
        {
            question: "Can I gift a rank to someone else?",
            answer: "Absolutely! During checkout, you can specify the Minecraft username of the player who should receive the rank."
        }
    ],
    
    // Appeal System Configuration
    discordWebhook: "https://discord.com/api/webhooks/1515747951085879487/KpCfGao_0OgwGRNMGbJCqZfXZSTP3YP52yBsW0afMPngP_vF-TxNPNKKCySZCxGOvijU"
};
