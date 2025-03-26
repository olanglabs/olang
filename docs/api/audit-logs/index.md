# Audit Logs API Documentation

This API provides access to system audit logs for monitoring and integration purposes. It supports various methods for retrieving and streaming log data, as well as configuring webhooks for real-time notifications.

## Authentication

All API requests must include an authorization token with admin privileges:

```
Authorization: Bearer YOUR_API_TOKEN
```

## Endpoints

### List Audit Logs

```
GET /api/audit
```

Retrieves a paginated list of audit logs with optional filtering.

#### Query Parameters

| Parameter | Type      | Description                                                |
| --------- | --------- | ---------------------------------------------------------- |
| limit     | Number    | Maximum number of logs to return (default: 100, max: 1000) |
| offset    | Number    | Number of logs to skip (for pagination)                    |
| startTime | Timestamp | Filter logs after this Unix timestamp                      |
| endTime   | Timestamp | Filter logs before this Unix timestamp                     |
| status    | Number    | Filter by HTTP status code                                 |
| method    | String    | Filter by HTTP method (GET, POST, etc.)                    |
| user      | String    | Filter by username                                         |

#### Response Format

```json
{
  "logs": [
    {
      "id": "log123456",
      "timestamp": 1678901234,
      "verb": "GET",
      "request_uri": "/api/resource",
      "response_status_code": 200,
      "source_ip": "192.168.1.1",
      "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin"
      },
      "request_object": "{ ... }",
      "response_object": "{ ... }",
      "chat_content": { ... }
    }
  ],
  "statistics": {
    "totalEntries": 1000,
    "uniqueUsers": 50,
    "errorRate": 5.2,
    "requestsByVerb": { ... },
    "requestsByStatusCode": { ... },
    "requestsByEndpoint": { ... },
    "requestsByModel": { ... }
  },
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 1000,
    "hasMore": true
  }
}
```

### Get Single Log Entry

```
GET /api/audit/{id}
```

Retrieves a specific audit log entry by its ID.

#### Response Format

```json
{
  "id": "log123456",
  "timestamp": 1678901234,
  "verb": "GET",
  "request_uri": "/api/resource",
  "response_status_code": 200,
  "source_ip": "192.168.1.1",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  },
  "request_object": "{ ... }",
  "response_object": "{ ... }",
  "chat_content": { ... }
}
```

### List Webhooks

```
GET /api/audit/webhook
```

Lists all configured webhooks with masked secrets.

#### Response Format

```json
{
  "webhooks": [
    {
      "url": "https://your-webhook-endpoint.com",
      "secret": "••••••••",
      "events": ["all", "error", "login", "admin_action"],
      "headers": {
        "X-Custom-Header": "custom-value"
      }
    }
  ]
}
```

### Configure Webhook

```
POST /api/audit/webhook
```

Configures a new webhook or updates an existing one.

#### Request Body

```json
{
  "url": "https://your-webhook-endpoint.com",
  "secret": "your_webhook_secret",
  "events": ["all", "error", "login", "admin_action"],
  "headers": {
    "X-Custom-Header": "custom-value"
  }
}
```

| Field   | Type     | Description                                  |
| ------- | -------- | -------------------------------------------- |
| url     | String   | The webhook URL (required)                   |
| secret  | String   | A secret token used for signature (required) |
| events  | String[] | Event types to send to this webhook          |
| headers | Object   | Additional headers to include in requests    |

#### Event Types

- `all`: All log events
- `error`: Error events (status code >= 400)
- `login`: Authentication events
- `admin_action`: Actions performed by admin users

#### Response Format

```json
{
  "success": true,
  "message": "Webhook configured successfully"
}
```

### Delete Webhook

```
DELETE /api/audit/webhook
```

Removes a webhook configuration.

#### Request Body

```json
{
  "url": "https://your-webhook-endpoint.com"
}
```

#### Response Format

```json
{
  "success": true,
  "message": "Webhook removed successfully"
}
```

### Stream Logs

```
GET /api/audit/stream
```

Provides a real-time stream of audit logs using Server-Sent Events (SSE).

#### Stream Format

```
data: {"type":"connected","message":"Stream connected successfully"}

data: {"id":"log123456","timestamp":1678901234,"verb":"GET",...}

data: {"type":"heartbeat"}
```

## Integration Examples

### Splunk Integration

To integrate with Splunk:

1. Use Splunk's HTTP Event Collector (HEC) as your webhook endpoint
2. Configure your HEC token as the secret in your webhook setup
3. Set appropriate headers for Splunk ingestion:

```json
{
  "url": "https://splunk-instance:8088/services/collector",
  "secret": "your-hec-token",
  "events": ["all"],
  "headers": {
    "Authorization": "Splunk your-hec-token"
  }
}
```

### Grafana Integration

For Grafana integration:

1. Use the JSON API data source plugin
2. Configure the data source to point to your `/api/audit` endpoint
3. Add your authentication token in the header settings
4. Create visualizations using the statistics data

### ELK Stack Integration

For ELK Stack:

1. Configure Logstash to receive webhook data
2. Set up an HTTP input plugin in Logstash
3. Configure your webhook to point to the Logstash HTTP endpoint

## JavaScript Example

```javascript
// Stream logs example
const eventSource = new EventSource(
  'https://your-domain.com/api/audit/stream',
  {
    headers: {
      Authorization: 'Bearer YOUR_API_TOKEN',
    },
  },
);

eventSource.onmessage = (event) => {
  const log = JSON.parse(event.data);
  console.log('New log:', log);
};

// Fetch logs example
async function fetchLogs() {
  const response = await fetch('https://your-domain.com/api/audit?limit=50', {
    headers: {
      Authorization: 'Bearer YOUR_API_TOKEN',
    },
  });

  const data = await response.json();
  console.log('Logs:', data.logs);
}
```

## Rate Limiting

The API is subject to rate limiting to prevent abuse. Excessive requests may result in temporary blocks.

## Error Responses

Error responses have the following format:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```
