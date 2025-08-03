import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Shield, 
  CheckCircle, 
  FileText,
  Save,
  Database
} from "lucide-react";

interface DocumentUploadResult {
  success: boolean;
  documentId: string;
  message: string;
  document: {
    id: string;
    type: string;
    uploadedAt: string;
    status: string;
  };
}

interface DocumentVerificationProps {
  patientId?: string;
  onDocumentUploaded?: (result: DocumentUploadResult) => void;
}

export default function DocumentVerification({ patientId, onDocumentUploaded }: DocumentVerificationProps) {
  const [documentText, setDocumentText] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploadResult, setUploadResult] = useState<DocumentUploadResult | null>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentText,
          documentType,
          patientId,
          fileName: fileName || `${documentType}_document`,
          fileSize: documentText.length
        }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json() as Promise<DocumentUploadResult>;
    },
    onSuccess: (data) => {
      setUploadResult(data);
      onDocumentUploaded?.(data);
      
      toast({
        title: "Document Saved Successfully",
        description: "Your document has been uploaded and saved to the database.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Upload Section */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Document Upload & Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Type Selection */}
          <div>
            <Label htmlFor="documentType">Document Type</Label>
            <Select onValueChange={setDocumentType} value={documentType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                <SelectItem value="pan">PAN Card</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="drivers_license">Driver's License</SelectItem>
                <SelectItem value="referral">Hospital Referral</SelectItem>
                <SelectItem value="medical_record">Medical Record</SelectItem>
                <SelectItem value="insurance_card">Insurance Card</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="lab_report">Lab Report</SelectItem>
                <SelectItem value="other">Other Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Name Input */}
          <div>
            <Label htmlFor="fileName">File Name (Optional)</Label>
            <Input
              id="fileName"
              placeholder="Enter file name..."
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Document Text Input */}
          <div>
            <Label htmlFor="documentText">Document Content</Label>
            <Textarea
              id="documentText"
              placeholder="Paste or type the document content here..."
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              className="mt-1 h-32"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your document will be securely stored in our database
            </p>
          </div>

          {/* Upload Button */}
          <Button
            onClick={() => uploadMutation.mutate()}
            disabled={!documentText.trim() || !documentType || !patientId || uploadMutation.isPending}
            className="w-full"
          >
            {uploadMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Document...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Document to Database
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResult && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Document Saved Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Success Message */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">
                  Document uploaded and saved to database successfully!
                </span>
              </div>
            </div>

            {/* Document Details */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center mb-3">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-gray-900">Document Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Document ID:</span>
                  <p className="text-gray-700 font-mono text-xs">{uploadResult.documentId}</p>
                </div>
                <div>
                  <span className="font-medium">Document Type:</span>
                  <p className="text-gray-700">{uploadResult.document.type}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(uploadResult.document.status)}>
                    {uploadResult.document.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Uploaded At:</span>
                  <p className="text-gray-700">{new Date(uploadResult.document.uploadedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="font-medium text-gray-900">What's Next?</h3>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Your document is now securely stored in our database</li>
                <li>• You can continue with the onboarding process</li>
                <li>• The document will be available for future reference</li>
                <li>• You can upload additional documents if needed</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 