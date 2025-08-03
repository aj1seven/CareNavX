import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Database,
  FileImage,
  FileType
} from "lucide-react";

interface FileUploadResult {
  success: boolean;
  documentId: string;
  message: string;
  document: {
    id: string;
    type: string;
    fileName: string;
    uploadedAt: string;
    status: string;
    fileSize: number;
  };
}

interface FileUploadProps {
  patientId?: string;
  onDocumentUploaded?: (result: FileUploadResult) => void;
}

interface UploadedFile {
  file: File;
  documentType: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function FileUpload({ patientId, onDocumentUploaded }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (fileData: { file: File; documentType: string }) => {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('documentType', fileData.documentType);
      formData.append('patientId', patientId || '');

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      return response.json() as Promise<FileUploadResult>;
    },
    onSuccess: (data, variables) => {
      // Update the file status to success
      setUploadedFiles(prev => 
        prev.map(file => 
          file.file === variables.file 
            ? { ...file, status: 'success' as const }
            : file
        )
      );
      
      onDocumentUploaded?.(data);
      
      toast({
        title: "File Uploaded Successfully",
        description: `${variables.documentType.replace('_', ' ')} has been saved to the database.`,
      });
    },
    onError: (error, variables) => {
      // Update the file status to error
      setUploadedFiles(prev => 
        prev.map(file => 
          file.file === variables.file 
            ? { ...file, status: 'error' as const, error: error.message }
            : file
        )
      );
      
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 50MB.",
        variant: "destructive",
      });
      return;
    }

    // Accept any file type - just check size
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 50MB.",
        variant: "destructive",
      });
      return;
    }

    // Remove any existing file of the same type
    setUploadedFiles(prev => prev.filter(f => f.documentType !== documentType));

    // Add new file
    const newFile: UploadedFile = {
      file,
      documentType,
      status: 'pending'
    };

    setUploadedFiles(prev => [...prev, newFile]);

    // Start upload
    uploadMutation.mutate({ file, documentType });
    
    // Update status to uploading
    setUploadedFiles(prev => 
      prev.map(f => 
        f.file === file 
          ? { ...f, status: 'uploading' as const }
          : f
      )
    );
  };

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileType className="h-4 w-4" />;
    if (fileType.includes('image')) return <FileImage className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'uploading': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'uploading': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Upload className="h-4 w-4" />;
    }
  };

  const documentTypes = [
    { 
      type: 'medical_history', 
      label: 'Medical History', 
      description: 'Upload your medical records, prescriptions, or health documents',
      required: true
    },
    { 
      type: 'aadhaar_card', 
      label: 'Aadhaar Card', 
      description: 'Upload your Aadhaar card for identity verification',
      required: true
    },
    { 
      type: 'pan_card', 
      label: 'PAN Card', 
      description: 'Upload your PAN card for identity verification',
      required: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Required Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {documentTypes.map((docType) => {
            const uploadedFile = uploadedFiles.find(f => f.documentType === docType.type);
            
            return (
              <div key={docType.type} className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {docType.label}
                      {docType.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{docType.description}</p>
                  </div>
                  {uploadedFile && (
                    <Badge className={getStatusColor(uploadedFile.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(uploadedFile.status)}
                        {uploadedFile.status}
                      </div>
                    </Badge>
                  )}
                </div>

                {!uploadedFile ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <Label htmlFor={`file-${docType.type}`} className="cursor-pointer">
                      <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-block">
                        Choose File
                      </div>
                    </Label>
                                         <input
                       id={`file-${docType.type}`}
                       type="file"
                       className="hidden"
                       onChange={(e) => handleFileSelect(e, docType.type)}
                     />
                     <p className="text-xs text-gray-500 mt-2">
                       Any file type up to 50MB
                     </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(uploadedFile.file.type)}
                        <div>
                          <p className="font-medium text-gray-900">{uploadedFile.file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadedFile.file)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {uploadedFile.error && (
                      <p className="text-sm text-red-600 mt-2">{uploadedFile.error}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Upload Summary */}
          {uploadedFiles.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Upload Summary</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">{file.documentType.replace('_', ' ')}</span>
                    <Badge className={getStatusColor(file.status)}>
                      {file.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 