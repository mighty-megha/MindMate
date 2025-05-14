// Script to seed 10 users with realistic data
import { db } from './server/db';
import { hashPassword } from './server/auth';
import { users, moodEntries, journalEntries, goals, insertUserSchema } from './shared/schema';
import { eq } from 'drizzle-orm';
import type { InsertUser } from './shared/schema';

// Function to wait/sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to get random date within the last 30 days
function getRandomDate(days = 30): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  return date;
}

// Moods for entries
const moods = ['Happy', 'Sad', 'Anxious', 'Calm', 'Energetic', 'Tired', 'Stressed', 'Grateful', 'Excited', 'Neutral'];

// Journal entry titles and contents
const journalTitles = [
  'Today was amazing',
  'Feeling down',
  'Anxiety creeping in',
  'Finding peace',
  'Energized day',
  'Exhausted but grateful',
  'Stress management',
  'Things I appreciate',
  'Looking forward to tomorrow',
  'Just an ordinary day',
  'New beginnings',
  'Reflecting on progress',
  'Challenges I faced',
  'Small victories'
];

const journalContents = [
  'Today I accomplished several tasks that have been on my to-do list for weeks. It feels great to finally make progress.',
  'Having a hard time focusing today. My thoughts keep drifting to negative scenarios that probably won\'t happen.',
  'Feeling anxious about my upcoming presentation. Need to practice breathing techniques more.',
  'Spent an hour meditating today. I feel much more centered and ready to face challenges.',
  'Woke up with so much energy today! Got through my workout and still had energy for a productive day.',
  'Barely made it through the day. Need to focus on getting better sleep tonight.',
  'Work deadlines are piling up. I need to organize my priorities better to manage this stress.',
  'Today I\'m grateful for my supportive friends, good health, and the opportunities ahead.',
  'Can\'t wait for the weekend trip we\'ve been planning. It\'s going to be amazing!',
  'Nothing special happened today, but sometimes ordinary days are good too.',
  'Starting a new project at work. It\'s both exciting and intimidating to begin something new.',
  'Looking back at how far I\'ve come with my mental health journey. Proud of my progress.',
  'Faced some difficult conversations today. Trying to process how I handled them.',
  'Celebrated small wins today - drinking enough water, taking short breaks, and being present in the moment.'
];

// Goal titles and descriptions
const goalTitles = [
  'Daily meditation',
  'Journal every day',
  'Exercise routine',
  'Healthy eating',
  'Better sleep habits',
  'Reduce screen time',
  'Connect with friends',
  'Practice gratitude',
  'Read more books',
  'Learn something new'
];

const goalDescriptions = [
  'Meditate for at least 10 minutes every day',
  'Write in my journal every evening before bed',
  'Exercise for 30 minutes at least 4 times a week',
  'Eat more vegetables and fewer processed foods',
  'Establish a consistent sleep schedule with 7-8 hours per night',
  'Limit social media to 30 minutes per day',
  'Reach out to at least one friend each week',
  'List 3 things I\'m grateful for each day',
  'Read for 20 minutes before bed instead of using phone',
  'Take an online course on a topic that interests me'
];

// Test users to create
const testUsers = [
  // Already created users - commented out
  // { username: 'sarah_j', fullName: 'Sarah Johnson', email: 'sarah.j@example.com', isAdmin: false },
  // { username: 'michael_t', fullName: 'Michael Thompson', email: 'michael.t@example.com', isAdmin: false },
  // { username: 'emily_w', fullName: 'Emily Wilson', email: 'emily.w@example.com', isAdmin: false },
  // { username: 'david_c', fullName: 'David Chen', email: 'david.c@example.com', isAdmin: false },
  // { username: 'jessica_m', fullName: 'Jessica Martinez', email: 'jessica.m@example.com', isAdmin: false },
  
  // Remaining users to create
  { username: 'james_b', fullName: 'James Brown', email: 'james.b@example.com', isAdmin: false },
  { username: 'sophia_g', fullName: 'Sophia Garcia', email: 'sophia.g@example.com', isAdmin: false },
  { username: 'daniel_r', fullName: 'Daniel Rodriguez', email: 'daniel.r@example.com', isAdmin: false },
  { username: 'olivia_l', fullName: 'Olivia Lopez', email: 'olivia.l@example.com', isAdmin: false },
  { username: 'william_k', fullName: 'William Kim', email: 'william.k@example.com', isAdmin: false }
];

// Main function to seed data
async function seedUsers() {
  console.log('Starting to seed 10 users with data...');
  
  for (const userInfo of testUsers) {
    try {
      // Check if user already exists
      const existingUsers = await db.select().from(users).where(eq(users.username, userInfo.username));
      
      if (existingUsers.length > 0) {
        console.log(`User ${userInfo.username} already exists, skipping...`);
        continue;
      }
      
      // Create the user
      const hashedPassword = await hashPassword('password123');
      
      const userData: InsertUser = {
        username: userInfo.username,
        password: hashedPassword,
        email: userInfo.email,
        fullName: userInfo.fullName,
        isAdmin: userInfo.isAdmin,
        profileImage: null,
        // Default notification settings as JSON string
        notificationSettings: JSON.stringify({
          emailNotifications: true,
          pushNotifications: true,
          reminderFrequency: 'daily'
        }),
        // Default appearance settings
        appearanceSettings: JSON.stringify({
          theme: 'light',
          fontSize: 'medium',
          colorScheme: 'blue'
        }),
        // Default privacy settings
        privacySettings: JSON.stringify({
          profileVisibility: 'friends',
          shareJournalEntries: false,
          shareMoodData: false
        }),
      };
      
      const [user] = await db.insert(users).values(userData).returning();
      
      console.log(`Created user: ${user.username} with ID: ${user.id}`);
      
      // Add 5-10 mood entries for the user
      const numMoodEntries = Math.floor(Math.random() * 6) + 5; // 5-10 entries
      for (let i = 0; i < numMoodEntries; i++) {
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const note = `Feeling ${mood.toLowerCase()} because of ${Math.random() > 0.5 ? 'work' : 'personal'} reasons.`;
        const createdAt = getRandomDate(30);
        
        const [moodEntry] = await db.insert(moodEntries).values({
          userId: user.id,
          mood,
          note,
          createdAt
        }).returning();
        
        console.log(`Created mood entry for ${user.username}: ${mood}`);
      }
      
      // Add 3-7 journal entries for the user
      const numJournalEntries = Math.floor(Math.random() * 5) + 3; // 3-7 entries
      for (let i = 0; i < numJournalEntries; i++) {
        const titleIndex = Math.floor(Math.random() * journalTitles.length);
        const contentIndex = Math.floor(Math.random() * journalContents.length);
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const createdAt = getRandomDate(30);
        
        const [journalEntry] = await db.insert(journalEntries).values({
          userId: user.id,
          title: journalTitles[titleIndex],
          content: journalContents[contentIndex],
          mood,
          createdAt
        }).returning();
        
        console.log(`Created journal entry for ${user.username}: ${journalEntry.title}`);
      }
      
      // Add 2-4 goals for the user
      const numGoals = Math.floor(Math.random() * 3) + 2; // 2-4 goals
      for (let i = 0; i < numGoals; i++) {
        const titleIndex = Math.floor(Math.random() * goalTitles.length);
        const descIndex = Math.floor(Math.random() * goalDescriptions.length);
        const completed = Math.random() > 0.7; // 30% chance of being completed
        
        // Target date between now and 30 days in the future
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + Math.floor(Math.random() * 30) + 1);
        
        const [goal] = await db.insert(goals).values({
          userId: user.id,
          title: goalTitles[titleIndex],
          description: goalDescriptions[descIndex],
          completed,
          targetDate
        }).returning();
        
        console.log(`Created goal for ${user.username}: ${goal.title} (${completed ? 'Completed' : 'In Progress'})`);
      }
      
      // Small pause between users to avoid overwhelming the database
      await sleep(500);
      
    } catch (error) {
      console.error(`Error creating user ${userInfo.username}:`, error);
    }
  }
  
  console.log('Seeding completed!');
  process.exit(0);
}

// Run the seed function
seedUsers().catch(e => {
  console.error('Error during seeding:', e);
  process.exit(1);
});