# Moonveil SMP Store

A premium, production-ready Minecraft server store website with a dark fantasy aesthetic inspired by Elden Ring and the Moonveil Katana.

## Features

- **Premium Dark Fantasy Design**: Deep blacks, dark blues, and purple glows with an Elden Ring-inspired aesthetic
- **Animated Starfield Background**: Dynamic twinkling stars and shooting stars
- **Glowing Moon Hero Section**: Large animated moon with crater details
- **Glassmorphism Cards**: Modern frosted glass effect on product cards
- **Smooth Animations**: Hover effects, transitions, and fade-in animations
- **Fully Responsive**: Optimized for desktop and mobile devices
- **Category Switching**: Easy navigation between Ranks, Crate Keys, and Misc
- **Configurable**: All pricing, links, and branding loaded from external configuration
- **Copy Server IP**: One-click server IP copy functionality
- **SEO Optimized**: Proper meta tags for search engines
- **No Frameworks**: Pure HTML, CSS, and JavaScript - no dependencies required
- **Shopping Cart System**: Add items to cart, manage quantities, and checkout
- **Discount/Coupon System**: Configurable discount codes with percentage or fixed amount discounts
- **Announcement Banners**: Configurable announcement banners for promotions and news
- **FAQ Modal**: Interactive FAQ section with expandable questions and answers
- **Minecraft Username Entry**: Players enter their username with live player head preview using Mojang API
- **Notification System**: Toast notifications for user actions

## Store Categories

### Ranks
- **Moon Rank** ($30) - Premium rank with exclusive perks
- **Lunar Rank** ($20) - Enhanced features and priority queue
- **Eclipse Rank** ($10) - Starter rank with basic perks

### Crate Keys
- **Crate Keys** (Configurable Price) - Unlock mysterious crates with rare items

### Misc
- **Unban** ($9) - Remove a ban from your account

## Setup Instructions

### 1. File Structure

Ensure your directory has the following files:
```
MoonveilSMP Webstore/
├── index.html
├── config.js
└── README.md
```

### 2. Configuration

Copy the example configuration file and customize it:

```bash
# Copy the example config
cp config.env.example config.js
```

Edit `config.js` with your actual values:

```javascript
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
    discounts: {
        "WELCOME20": { type: "percentage", value: 20 },
        "SUMMER10": { type: "percentage", value: 10 },
        "SAVE5": { type: "fixed", value: 5 }
    },
    
    // FAQ Items
    faqItems: [
        {
            question: "How do I receive my rank?",
            answer: "After purchase, your rank will be automatically applied to your account within 5-10 minutes."
        }
    ]
};
```

### 3. Deployment

#### Local Testing
Simply open `index.html` in your web browser, or use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (with http-server)
npx http-server
```

Then visit `http://localhost:8000`

#### Web Hosting
Upload the files to any web hosting service:
- GitHub Pages
- Netlify
- Vercel
- Traditional web hosting
- Your own server

No build process or dependencies required - just upload the files!

## Configuration Options

### Server Information
- `serverName`: Display name of your server
- `serverIP`: Server IP address (clickable to copy)

### Pricing
- `moonPrice`: Price for Moon Rank (USD)
- `lunarPrice`: Price for Lunar Rank (USD)
- `eclipsePrice`: Price for Eclipse Rank (USD)
- `unbanPrice`: Price for Unban (USD)
- `crateKeyPrice`: Price for Crate Keys (USD)

### Purchase Links
- `moonLink`: URL where users purchase Moon Rank
- `lunarLink`: URL where users purchase Lunar Rank
- `eclipseLink`: URL where users purchase Eclipse Rank
- `unbanLink`: URL where users purchase Unban
- `crateLink`: URL where users purchase Crate Keys

### Discord
- `discordLink`: Your Discord server invite link

### Announcement Banner
- `announcementEnabled`: Enable/disable the announcement banner (true/false)
- `announcementText`: The text displayed in the announcement banner

### Discount Codes
- `discounts`: Object containing discount code configurations
  - Code format: `{ type: "percentage"|"fixed", value: number }`
  - Percentage: value is the percentage off (e.g., 20 for 20% off)
  - Fixed: value is the fixed amount off (e.g., 5 for $5 off)

### FAQ Items
- `faqItems`: Array of FAQ objects with `question` and `answer` properties
  - Add as many FAQ items as needed
  - Questions are expandable/collapsible in the modal

## Customization

### Colors
To customize the color scheme, edit the CSS variables in `index.html`:

```css
:root {
    --bg-primary: #0a0a0f;
    --bg-secondary: #12121a;
    --bg-tertiary: #1a1a2e;
    --accent-purple: #8b5cf6;
    --accent-blue: #3b82f6;
    /* ... more variables */
}
```

### Products
To add or modify products, edit the `products` object in the JavaScript section of `index.html`:

```javascript
const products = {
    ranks: [
        {
            name: "Your Rank",
            description: "Rank description",
            price: "yourPriceConfigKey",
            link: "yourLinkConfigKey",
            icon: "🎮"
        }
    ],
    // ... other categories
};
```

### Adding Discount Codes
To add new discount codes, edit the `discounts` object in `config.js`:

```javascript
discounts: {
    "NEWCODE": { type: "percentage", value: 25 },  // 25% off
    "FIXED10": { type: "fixed", value: 10 }         // $10 off
}
```

### Managing FAQ Items
To add or modify FAQ items, edit the `faqItems` array in `config.js`:

```javascript
faqItems: [
    {
        question: "Your question here?",
        answer: "Your detailed answer here."
    }
]
```

### Username Entry Page
The username entry page appears when users first visit the store. It:
- Validates usernames using the Mojang API
- Shows the player's head using Crafatar
- Stores the username in localStorage for future visits
- Can be disabled by removing the username page HTML elements

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lightweight single-file architecture
- No external dependencies
- Optimized CSS animations
- Minimal JavaScript overhead
- Fast loading times

## Security Notes

- The configuration file (`config.js`) is loaded client-side
- Do not store sensitive information (API keys, secrets) in the config
- Purchase links should point to your secure payment processor (Tebex, Buycraft, etc.)
- Consider using HTTPS for production deployments

## License

This project is provided as-is for use with your Minecraft server.

## Support

For issues or questions, please contact your server administration team or join our Discord server.
