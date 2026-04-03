# Password Generator API

Secure password generator with customizable options.

## Features

- Cryptographically secure random generation
- Customizable length (4-128 characters)
- Multiple character types (lowercase, uppercase, numbers, symbols)
- Exclude similar/ambiguous characters
- Passphrase generation (word-based passwords)
- Password strength analysis

## API Usage

```
GET /api/index
```

### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| length | 16 | Password length |
| lowercase | true | Include lowercase letters |
| uppercase | true | Include uppercase letters |
| numbers | true | Include numbers |
| symbols | true | Include symbols |
| excludeSimilar | false | Exclude i, l, 1, L, o, 0, O |
| excludeAmbiguous | false | Exclude { } [ ] ( ) etc |
| count | 1 | Number of passwords (max 10) |
| type | password | password or passphrase |
| demo | false | Set to true for free testing |

## Example

```
GET /api/index?length=20&demo=true
```

Returns:
```json
{
  "success": true,
  "passwords": ["Kx9#mP2$vL7@nQ4&wR8*"],
  "strength": {
    "score": 8,
    "level": "very-strong",
    "entropy": 127
  }
}
```

## Pricing

$0.02 per generation
