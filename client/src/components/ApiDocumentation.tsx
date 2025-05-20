import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ApiDocumentation() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Alpha Translation API Documentation</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          This documentation provides details on the API endpoints available for integrating with our translation service.
          All API endpoints require authentication using your API key.
        </p>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>API keys must be included in all requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Include your API key in the headers of all requests:</p>
            <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
              <pre>{'Authorization: Bearer YOUR_API_KEY'}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="translation-requests">
        <TabsList className="mb-4">
          <TabsTrigger value="translation-requests">Translation Requests</TabsTrigger>
          <TabsTrigger value="files">Files & Assets</TabsTrigger>
          <TabsTrigger value="account">Account & Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="translation-requests">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Push Translation Request</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">POST</Badge>
                </div>
                <CardDescription>Create a new translation request</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/translation-requests'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Request Format</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "fileName": "example.docx",
  "fileId": "file_123456", // File ID from a previous upload
  "sourceLanguage": "English",
  "targetLanguages": ["French", "German", "Spanish"],
  "workflow": "ai-neural" // Options: ai-neural, ai-translation-qc, ai-translation-human
}`}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "id": 12345,
  "status": "pending",
  "creditsRequired": 5000,
  "totalCost": "£50.00",
  "estimatedCompletionTime": "2023-05-21T15:30:00Z"
}`}</pre>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Get Translation Request Details</CardTitle>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">GET</Badge>
                </div>
                <CardDescription>Retrieve details about a specific translation request</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/translation-requests/{id}'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Parameters</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'id: The unique identifier of the translation request'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "id": 12345,
  "status": "translation-in-progress",
  "fileName": "example.docx",
  "fileFormat": "DOCX",
  "fileSize": 256000,
  "wordCount": 5000,
  "characterCount": 25000,
  "sourceLanguage": "English",
  "targetLanguages": ["French", "German", "Spanish"],
  "workflow": "ai-neural",
  "completionPercentage": 35,
  "createdAt": "2023-05-20T10:15:00Z",
  "updates": [
    {
      "id": 1,
      "content": "Translation started",
      "type": "status_change",
      "createdAt": "2023-05-20T10:20:00Z"
    }
  ]
}`}</pre>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Update Translation Request Status</CardTitle>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">PATCH</Badge>
                </div>
                <CardDescription>Update the status or details of a translation request</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/translation-requests/{id}'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Request Format</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "status": "lqa-in-progress", // Optional
  "priority": "high", // Optional
  "completionPercentage": 50, // Optional
  "dueDate": "2023-05-25T23:59:59Z" // Optional
}`}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "id": 12345,
  "status": "lqa-in-progress",
  "completionPercentage": 50,
  "updatedAt": "2023-05-20T15:30:00Z"
}`}</pre>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Add Update to Translation Request</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">POST</Badge>
                </div>
                <CardDescription>Add a status update, note, or milestone to a translation request</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/translation-requests/{id}/updates'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Request Format</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "updateType": "status_change", // Options: note, status_change, milestone, issue
  "updateText": "Quality assurance process has started",
  "newStatus": "lqa-in-progress" // Only required for status_change type
}`}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "id": 123,
  "requestId": 12345,
  "content": "Quality assurance process has started",
  "type": "status_change",
  "createdAt": "2023-05-20T15:30:00Z"
}`}</pre>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>List Translation Requests</CardTitle>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">GET</Badge>
                </div>
                <CardDescription>Get a list of all translation requests</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/translation-requests'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Query Parameters</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`status - Filter by status (pending, translation-in-progress, etc.)
dateFrom - ISO date string to filter by creation date
dateTo - ISO date string to filter by creation date
limit - Number of results to return (default: 50)
offset - Pagination offset (default: 0)`}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "totalCount": 120,
  "results": [
    {
      "id": 12345,
      "fileName": "example.docx",
      "status": "translation-in-progress",
      "sourceLanguage": "English",
      "targetLanguages": ["French", "German", "Spanish"],
      "completionPercentage": 35,
      "createdAt": "2023-05-20T10:15:00Z"
    },
    // more items...
  ]
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="files">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upload File</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">POST</Badge>
                </div>
                <CardDescription>Upload a file for translation or as a supporting asset</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/files/upload'}</pre>
                </div>
                
                <p className="mb-2">This is a multipart/form-data request with the following fields:</p>
                
                <h4 className="font-medium mb-2">Form Data</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`file: The file to upload (required)
type: "translation" or "asset" (required)
description: Description of the file (optional)`}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "fileId": "file_123456",
  "fileName": "example.docx",
  "fileSize": 256000,
  "fileFormat": "DOCX",
  "uploadedAt": "2023-05-20T10:15:00Z",
  "analysis": {
    "wordCount": 5000,
    "characterCount": 25000,
    "imagesWithText": 3,
    "sourceLanguage": "English",
    "subjectMatter": "Technical, Marketing"
  }
}`}</pre>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Get File Analysis</CardTitle>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">GET</Badge>
                </div>
                <CardDescription>Get detailed analysis of an uploaded file</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/files/{fileId}/analysis'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Parameters</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'fileId: The unique identifier of the file'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "fileId": "file_123456",
  "fileName": "example.docx",
  "fileSize": 256000,
  "fileFormat": "DOCX",
  "analysis": {
    "wordCount": 5000,
    "characterCount": 25000,
    "imagesWithText": 3,
    "sourceLanguage": "English",
    "subjectMatter": "Technical, Marketing",
    "complexityScore": 0.75,
    "estimatedTimeToTranslate": "2 hours"
  }
}`}</pre>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Download Translated File</CardTitle>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">GET</Badge>
                </div>
                <CardDescription>Download a completed translation file</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/translation-requests/{requestId}/files/{language}'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Parameters</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`requestId: The unique identifier of the translation request
language: The target language code (e.g., "fr" for French)`}</pre>
                </div>
                
                <p className="mb-2">This endpoint returns the file directly as a download. The Content-Disposition header will include the filename.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Update Translated Files</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">POST</Badge>
                </div>
                <CardDescription>Upload updated translated files for a request</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/translation-requests/{requestId}/files'}</pre>
                </div>
                
                <p className="mb-2">This is a multipart/form-data request with the following fields:</p>
                
                <h4 className="font-medium mb-2">Form Data</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`file: The translated file (required)
language: The language code for this translation (required)
version: Version number (optional, defaults to incremental)`}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "fileId": "file_789012",
  "language": "fr",
  "version": 2,
  "uploadedAt": "2023-05-21T14:30:00Z"
}`}</pre>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>List Translation Assets</CardTitle>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">GET</Badge>
                </div>
                <CardDescription>Get a list of all translation assets</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/assets'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Query Parameters</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`fileType - Filter by file type (e.g., "glossary", "style-guide")
limit - Number of results to return (default: 50)
offset - Pagination offset (default: 0)`}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "totalCount": 25,
  "results": [
    {
      "id": "asset_123",
      "fileName": "company-glossary.xlsx",
      "fileType": "glossary",
      "fileSize": 102400,
      "description": "Official company terminology",
      "uploadedAt": "2023-04-15T09:30:00Z"
    },
    // more items...
  ]
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="account">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Get Account Details</CardTitle>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">GET</Badge>
                </div>
                <CardDescription>Retrieve account information</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/account'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "id": 1,
  "name": "Alpha Translations Ltd",
  "credits": 75000,
  "subscriptionPlan": "pro",
  "subscriptionStatus": "active",
  "subscriptionRenewal": "2023-06-20T23:59:59Z"
}`}</pre>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Get User Details</CardTitle>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">GET</Badge>
                </div>
                <CardDescription>Retrieve information about the current user</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/user'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "id": 1,
  "accountId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "admin",
  "jobTitle": "Localization Manager"
}`}</pre>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Get Account Users</CardTitle>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">GET</Badge>
                </div>
                <CardDescription>Retrieve a list of all users associated with the account</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/account/users'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "totalCount": 5,
  "results": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "admin",
      "lastActive": "2023-05-20T15:30:00Z"
    },
    // more users...
  ]
}`}</pre>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Purchase Credits</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">POST</Badge>
                </div>
                <CardDescription>Add credits to the account</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/account/credits/purchase'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Request Format</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "credits": 10000,
  "paymentMethod": "card", // or "invoice"
  "paymentToken": "tok_123456" // Only required for card payments
}`}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "transactionId": "txn_123456",
  "creditsAdded": 10000,
  "totalCredits": 85000,
  "receipt": "https://example.com/receipts/txn_123456"
}`}</pre>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Get Credit Usage History</CardTitle>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">GET</Badge>
                </div>
                <CardDescription>Retrieve credit usage history</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                  <pre>{'/api/v1/account/credits/history'}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Query Parameters</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`dateFrom - ISO date string to filter by date
dateTo - ISO date string to filter by date
type - "purchase" or "usage" (optional)
limit - Number of results to return (default: 50)
offset - Pagination offset (default: 0)`}</pre>
                </div>
                
                <h4 className="font-medium mb-2">Response</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "totalCount": 150,
  "results": [
    {
      "id": "hist_123",
      "type": "usage",
      "amount": -5000,
      "description": "Translation request #12345",
      "requestId": 12345,
      "timestamp": "2023-05-19T10:15:00Z"
    },
    {
      "id": "hist_122",
      "type": "purchase",
      "amount": 10000,
      "description": "Credit purchase",
      "transactionId": "txn_123456",
      "timestamp": "2023-05-15T14:30:00Z"
    },
    // more items...
  ]
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p className="mb-2">For additional assistance or questions about our API, please contact our support team:</p>
        <p><strong>Email:</strong> api-support@alpha-translations.com</p>
        <p><strong>Phone:</strong> +44 1234 567890</p>
      </div>
    </div>
  );
}