# Internationalization (i18n) Implementation Guide

## Overview

The Civic Portal now supports bilingual functionality with English and Setswana (Tswana) languages. This implementation uses industry-standard i18n libraries and follows best practices for maintainable, scalable internationalization.

## Technical Stack

- **i18next**: Core internationalization framework
- **react-i18next**: React bindings for i18next
- **i18next-browser-languagedetector**: Automatic language detection

## Architecture

### File Structure

```
src/
├── lib/
│   └── i18n.ts                 # i18n configuration
├── locales/
│   ├── en/
│   │   └── ui.json             # English translations
│   └── tn/
│       └── ui.json             # Setswana translations
├── components/
│   └── common/
│       └── LanguageSwitcher.tsx # Language switcher component
└── types/
    └── i18next.d.ts            # TypeScript definitions
```

### Key Features

1. **Manual Translation Management**: All UI text is stored in editable JSON files
2. **User-Generated Content Preservation**: Only UI elements are translated, not user content
3. **Responsive Design**: Layout adapts to different text lengths between languages
4. **Persistent Language Choice**: User's language preference is saved in localStorage
5. **TypeScript Support**: Full type safety for translation keys

## Usage

### Basic Translation

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation('ui');
  
  return (
    <div>
      <h1>{t('appTitle')}</h1>
      <button>{t('buttons.submit')}</button>
    </div>
  );
};
```

### Language Switching

```typescript
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const Header = () => {
  return (
    <header>
      {/* Other header content */}
      <LanguageSwitcher />
    </header>
  );
};
```

## Translation Keys Structure

### Navigation
- `nav.home` - Home
- `nav.dashboard` - Dashboard
- `nav.issues` - Issues
- `nav.reports` - Reports
- `nav.about` - About
- `nav.faq` - FAQ

### Authentication
- `auth.signIn` - Sign In
- `auth.signUp` - Sign Up
- `auth.signOut` - Sign Out
- `auth.email` - Email
- `auth.password` - Password

### Common UI Elements
- `buttons.submit` - Submit
- `buttons.cancel` - Cancel
- `buttons.save` - Save
- `common.loading` - Loading...
- `common.error` - Error

### Status Values
- `issueStatuses.open` - Open
- `issueStatuses.in_progress` - In Progress
- `issueStatuses.resolved` - Resolved
- `issueStatuses.closed` - Closed

## Design Considerations

### Text Length Flexibility

The UI uses flexible CSS layouts to accommodate varying text lengths:

```css
/* Flexible button sizing */
.button {
  @apply px-4 py-2 whitespace-nowrap min-w-0;
}

/* Responsive navigation */
.nav-item {
  @apply break-words overflow-wrap-anywhere;
}
```

### Responsive Behavior

- Desktop: Full language names displayed
- Mobile: Compact language switcher in mobile menu
- Text wrapping: Graceful handling of longer Setswana phrases

## Testing

### Cypress Tests

Language switching functionality is tested with Cypress:

```javascript
// Test language switching
cy.switchToLanguage('Setswana');
cy.contains('Lephata la Baagi').should('be.visible');

// Test persistence
cy.setLanguage('tn');
cy.reload();
cy.contains('Dikgang').should('be.visible');
```

### Manual Testing Checklist

1. ✅ Language switcher appears in header (desktop)
2. ✅ Language switcher appears in mobile menu
3. ✅ All navigation items translate correctly
4. ✅ Footer content translates correctly
5. ✅ User dropdown menu items translate correctly
6. ✅ Language choice persists after page reload
7. ✅ Layout remains intact with longer Setswana text
8. ✅ Mobile responsive behavior works correctly

## Adding New Translations

### 1. Add to English file (`src/locales/en/ui.json`)

```json
{
  "newSection": {
    "newKey": "New English Text"
  }
}
```

### 2. Add to Setswana file (`src/locales/tn/ui.json`)

```json
{
  "newSection": {
    "newKey": "Mokwalo o Mosha wa Setswana"
  }
}
```

### 3. Use in component

```typescript
const { t } = useTranslation('ui');
return <span>{t('newSection.newKey')}</span>;
```

## Best Practices

1. **Consistent Key Naming**: Use descriptive, hierarchical keys
2. **Context Awareness**: Group related translations together
3. **Fallback Handling**: Always provide English fallbacks
4. **Layout Testing**: Test UI with both languages regularly
5. **Professional Translation**: Use qualified Setswana translators for accuracy

## Future Enhancements

- Support for additional local languages (Kalanga, Herero)
- Right-to-left language support
- Pluralization rules for complex grammar
- Date and number localization
- Voice-to-text in both languages

## Troubleshooting

### Common Issues

1. **Missing translations**: Check console for missing key warnings
2. **Layout breaks**: Review CSS for fixed widths, add flexibility
3. **Language not persisting**: Verify localStorage is enabled
4. **TypeScript errors**: Update `src/types/i18next.d.ts` with new keys

### Debug Mode

Enable debug mode in development:

```typescript
// In src/lib/i18n.ts
i18n.init({
  debug: true, // Shows missing keys in console
  // ... other config
});
```
