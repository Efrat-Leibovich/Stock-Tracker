# Requirements Document

## Introduction

אפליקציית מעקב מניות למתחילים — פלטפורמה חינוכית שמאפשרת לאנשים שאינם מכירים את שוק ההון להתחיל להבין ולעקוב אחר מניות. כל אלמנט בממשק מלווה בהסבר פשוט בעברית, כך שמשתמש שמעולם לא נגע במניות יוכל להבין מה הוא רואה ולמה זה חשוב.

## Glossary

- **Stock (מניה)**: חלק קטן מבעלות על חברה. כשקונים מניה של חברה, הופכים לבעלים חלקיים שלה
- **Ticker (סמל מניה)**: קוד קצר של אותיות שמזהה חברה בבורסה, למשל `AAPL` = Apple, `TSLA` = Tesla
- **Watchlist (רשימת מעקב)**: רשימה אישית של מניות שהמשתמש רוצה לעקוב אחריהן
- **Quote (ציטוט מחיר)**: נתוני המחיר העדכניים של מניה — מחיר נוכחי, שינוי יומי, אחוז שינוי
- **Price Change (שינוי מחיר)**: ההפרש בין מחיר הפתיחה של היום למחיר הנוכחי
- **Volume (נפח מסחר)**: כמה מניות נקנו ונמכרו היום — מספר גבוה מעיד על עניין רב בחברה
- **Stock_Service**: רכיב האחראי על שליפת נתוני מניות מ-API חיצוני
- **Watchlist_Store**: רכיב האחראי על שמירת רשימת המעקב
- **Tooltip**: הסבר קצר שמופיע כשמרחפים מעל אלמנט בממשק
- **UI**: ממשק המשתמש של האפליקציה

## Requirements

### Requirement 1: חיפוש מניות

**User Story:** As a beginner investor, I want to search for stocks by company name or ticker symbol, so that I can find companies I recognize and learn about their stock.

#### Acceptance Criteria

1. WHEN a user enters a ticker symbol or company name, THE Stock_Service SHALL return a list of matching stocks
2. WHEN no matching stocks are found, THE Stock_Service SHALL return an empty list and THE UI SHALL display a "no results" message
3. WHEN an invalid or empty search query is submitted, THE UI SHALL display a validation error and prevent the search
4. THE Stock_Service SHALL return results within 3 seconds of a search request
5. WHEN search results are displayed, THE UI SHALL show a beginner tip explaining what a ticker symbol is

---

### Requirement 2: צפייה בנתוני מניה עם הסברים

**User Story:** As a beginner investor, I want to see stock data with plain-language explanations, so that I understand what each number means.

#### Acceptance Criteria

1. WHEN a user selects a stock, THE UI SHALL display the current price, daily change (absolute and percentage), and trading volume
2. WHEN the stock data is loading, THE UI SHALL display a loading indicator
3. IF the Stock_Service fails to fetch data, THEN THE UI SHALL display a descriptive error message
4. THE UI SHALL display the stock's ticker symbol and company name prominently
5. WHEN price change is positive, THE UI SHALL display it in green; WHEN negative, THE UI SHALL display it in red
6. THE UI SHALL display a Tooltip next to each metric explaining what it means in plain Hebrew (e.g. next to "Volume" — "כמה מניות נקנו ונמכרו היום")
7. THE UI SHALL display a plain-language summary sentence describing the stock's daily performance (e.g. "המניה עלתה ב-2.3% היום — זה אומר שהיא שווה יותר מאתמול")

---

### Requirement 3: ניהול רשימת מעקב

**User Story:** As a beginner investor, I want to maintain a personal watchlist of stocks, so that I can track companies I'm interested in over time.

#### Acceptance Criteria

1. WHEN a user adds a stock to the watchlist, THE Watchlist_Store SHALL persist the stock and THE UI SHALL reflect the addition immediately
2. WHEN a user removes a stock from the watchlist, THE Watchlist_Store SHALL remove it and THE UI SHALL reflect the removal immediately
3. IF a user attempts to add a stock that already exists in the watchlist, THEN THE System SHALL prevent duplication and notify the user
4. WHEN the application loads, THE Watchlist_Store SHALL restore the previously saved watchlist
5. THE Watchlist_Store SHALL persist the watchlist to local storage
6. WHEN a user adds their first stock to the watchlist, THE UI SHALL display a congratulatory message explaining the purpose of a watchlist

---

### Requirement 4: תצוגת רשימת המעקב

**User Story:** As a beginner investor, I want to see all my watched stocks at a glance with simple explanations, so that I can monitor them easily.

#### Acceptance Criteria

1. WHEN the watchlist view is displayed, THE UI SHALL show all watched stocks with their current price and daily change percentage
2. WHEN the watchlist is empty, THE UI SHALL display a welcoming message explaining what a watchlist is and how to add stocks
3. WHEN a user clicks on a stock in the watchlist, THE UI SHALL navigate to that stock's detail view
4. THE UI SHALL refresh watchlist prices automatically every 60 seconds
5. THE UI SHALL display a brief explanation at the top of the watchlist view explaining what the user is looking at

---

### Requirement 5: מדריך למתחילים

**User Story:** As a beginner investor, I want access to simple explanations of stock market concepts, so that I can learn as I use the app.

#### Acceptance Criteria

1. THE UI SHALL display a "מילון מונחים" (glossary) section accessible from the main navigation
2. WHEN a user opens the glossary, THE UI SHALL display plain-Hebrew definitions for: מניה, ticker, נפח מסחר, שינוי יומי, רשימת מעקב
3. THE UI SHALL display a "טיפ יומי" (daily tip) on the home screen with a beginner-friendly fact about stock investing
4. WHEN a user hovers over any financial term in the UI, THE UI SHALL display a Tooltip with a plain-Hebrew explanation

---

### Requirement 6: טיפול בשגיאות ומצבי קצה

**User Story:** As a user, I want the application to handle errors gracefully, so that I have a smooth experience even when things go wrong.

#### Acceptance Criteria

1. IF the network is unavailable, THEN THE Stock_Service SHALL return a descriptive error and THE UI SHALL display an offline message
2. IF the external API returns an error response, THEN THE Stock_Service SHALL log the error and return a structured error object
3. WHEN an error occurs, THE UI SHALL provide a retry option to the user
4. IF a ticker symbol does not exist, THEN THE Stock_Service SHALL return a "not found" error
