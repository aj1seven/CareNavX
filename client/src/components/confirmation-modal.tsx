import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MapPin, Printer, User, CreditCard } from "lucide-react";

interface ConfirmationModalProps {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    admissionLocation: string;
    insuranceStatus?: string;
    isEmergency?: boolean;
  };
  onClose: () => void;
}

export function ConfirmationModal({ patient, onClose }: ConfirmationModalProps) {
  const handlePrintWristband = () => {
    // In a real implementation, this would trigger a print job
    console.log("Printing wristband for patient:", patient.id);
    alert("Wristband print job sent to printer");
  };

  const getLocationDetails = (location: string) => {
    if (location.includes("Emergency")) {
      return {
        floor: "Ground Floor",
        wing: "East Wing",
        icon: "🚨"
      };
    }
    return {
      floor: "Floor 2",
      wing: "West Wing",
      icon: "🏥"
    };
  };

  const locationDetails = getLocationDetails(patient.admissionLocation);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-success-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-success-green h-8 w-8" />
          </div>
          <DialogTitle className="text-xl font-semibold text-text-primary">
            Onboarding Complete!
          </DialogTitle>
          <p className="text-text-secondary">
            Patient has been successfully registered and verified.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Admission Location */}
          <div className="bg-medical-blue bg-opacity-10 rounded-lg p-4">
            <h4 className="font-semibold text-medical-blue mb-3 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Patient Admission Location
            </h4>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">{locationDetails.icon}</span>
                <span className="font-medium text-text-primary text-lg">
                  {patient.admissionLocation}
                </span>
              </div>
              <p className="text-text-secondary text-sm">
                {locationDetails.floor}, {locationDetails.wing}
              </p>
            </div>
          </div>

          {/* Patient Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-text-primary mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Patient Summary
            </h4>
            <dl className="space-y-2">
              <div className="flex justify-between items-center">
                <dt className="text-text-secondary text-sm">Name:</dt>
                <dd className="text-text-primary font-medium">
                  {patient.firstName} {patient.lastName}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-text-secondary text-sm">Patient ID:</dt>
                <dd className="text-text-primary font-medium font-mono text-sm">
                  {patient.id.substring(0, 13).toUpperCase()}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-text-secondary text-sm">Insurance:</dt>
                <dd>
                  <Badge 
                    variant={patient.insuranceStatus === "verified" ? "default" : "secondary"}
                    className={
                      patient.insuranceStatus === "verified" 
                        ? "bg-success-green text-white" 
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {patient.insuranceStatus === "verified" ? "Verified" : "Pending"}
                  </Badge>
                </dd>
              </div>
              {patient.isEmergency && (
                <div className="flex justify-between items-center">
                  <dt className="text-text-secondary text-sm">Priority:</dt>
                  <dd>
                    <Badge variant="destructive" className="bg-emergency-red">
                      Emergency
                    </Badge>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button 
              className="flex-1 bg-medical-blue hover:bg-blue-700 text-white"
              onClick={handlePrintWristband}
            >
              <Printer className="h-4 w-4 mr-2" />
              Printer Wristband
            </Button>
            <Button 
              className="flex-1 bg-success-green hover:bg-green-600 text-white"
              onClick={onClose}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
