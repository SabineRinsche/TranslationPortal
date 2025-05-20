import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  FileText, 
  Calendar, 
  Download,
  ArrowUpDown,
  FileArchive,
  FileImage,
  FileCode,
  File,
  Upload
} from 'lucide-react';
import { format } from 'date-fns';

// Define the Asset type
interface Asset {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  description?: string;
  userId: number;
}

// Mock data for translation assets (this would come from the API in a real implementation)
const mockAssets: Asset[] = [
  {
    id: 1,
    fileName: 'brand_guidelines.pdf',
    fileSize: 2450000, // in bytes
    fileType: 'pdf',
    uploadDate: '2023-09-15T10:30:00Z',
    description: 'Brand guidelines for marketing materials',
    userId: 1
  },
  {
    id: 2,
    fileName: 'glossary_technical_terms.xlsx',
    fileSize: 350000,
    fileType: 'xlsx',
    uploadDate: '2023-10-02T14:45:00Z',
    description: 'Technical terminology glossary for product translations',
    userId: 1
  },
  {
    id: 3,
    fileName: 'corporate_style_guide.docx',
    fileSize: 890000,
    fileType: 'docx',
    uploadDate: '2023-11-10T09:15:00Z',
    description: 'Corporate style guide for consistent translations',
    userId: 1
  },
  {
    id: 4,
    fileName: 'product_images.zip',
    fileSize: 12500000,
    fileType: 'zip',
    uploadDate: '2023-12-05T11:20:00Z',
    description: 'Product images with text for reference',
    userId: 1
  },
  {
    id: 5,
    fileName: 'legal_terminology.csv',
    fileSize: 125000,
    fileType: 'csv',
    uploadDate: '2024-01-18T16:10:00Z',
    description: 'Legal terminology for contract translations',
    userId: 1
  }
];

export default function TranslationAssetsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // In a real implementation, this would fetch from the API
  // const { data: assets, isLoading } = useQuery<Asset[]>({
  //   queryKey: ['/api/translation-assets'],
  // });
  
  // Using mock data for now
  const assets = mockAssets;
  const isLoading = false;
  
  // Filter and sort assets
  const filteredAssets = assets?.filter(asset => {
    return !searchTerm || 
      asset.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.description && asset.description.toLowerCase().includes(searchTerm.toLowerCase()));
  }) || [];
  
  // Sort assets
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    const dateA = new Date(a.uploadDate);
    const dateB = new Date(b.uploadDate);
    
    return sortOrder === 'desc' 
      ? dateB.getTime() - dateA.getTime() 
      : dateA.getTime() - dateB.getTime();
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };
  
  // Get the appropriate icon for the file type
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
      case 'docx':
      case 'doc':
      case 'txt':
        return <FileText className="h-10 w-10 text-blue-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileCode className="h-10 w-10 text-green-500" />;
      case 'zip':
      case 'rar':
        return <FileArchive className="h-10 w-10 text-purple-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-10 w-10 text-orange-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
          <div>
            <CardTitle>Translation Assets</CardTitle>
            <CardDescription>Manage supporting documents and reference materials</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </Button>
            <Button className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload Asset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {sortedAssets.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No translation assets found</p>
            {searchTerm ? (
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search</p>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedAssets.map((asset) => (
              <div
                key={asset.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start">
                  <div className="mr-4">
                    {getFileIcon(asset.fileType)}
                  </div>
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="font-medium text-lg truncate">{asset.fileName}</h3>
                    {asset.description && (
                      <p className="text-muted-foreground text-sm mt-1">{asset.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        Uploaded: {formatDate(asset.uploadDate)}
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1.5" />
                        {formatFileSize(asset.fileSize)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Download className="h-4 w-4 mr-1.5" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}