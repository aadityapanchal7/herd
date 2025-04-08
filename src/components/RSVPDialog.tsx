
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Event } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RSVPDialogProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const RSVPDialog: React.FC<RSVPDialogProps> = ({ event, isOpen, onClose }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRSVP = async () => {
    if (!event || !user) return;
    
    try {
      setIsSubmitting(true);
      
      console.log("Attempting to RSVP with event ID:", event.id);
      console.log("User ID:", user.id);
      
      // Insert into RSVP table
      const { error: rsvpError } = await supabase
        .from('rsvps')
        .insert({
          event_id: event.id,
          user_id: user.id,
          name: user.email?.split('@')[0] || 'Anonymous',
          email: user.email || '',
        });
        
      if (rsvpError) {
        console.error("RSVP insert error:", rsvpError);
        throw rsvpError;
      }
      
      // Update event attendee count
      const { error: updateError } = await supabase
        .from('events')
        .update({ attendees: event.attendees + 1 })
        .eq('id', event.id);
        
      if (updateError) {
        console.error("Event update error:", updateError);
        throw updateError;
      }
      
      // Send confirmation email
      if (user.email) {
        try {
          // Send a verification email for RSVP
          const response = await supabase.functions.invoke('send-rsvp-verification', {
            body: {
              email: user.email,
              name: user.email?.split('@')[0] || '',
              eventTitle: event.title,
              eventDate: event.date,
              eventLocation: event.location_name
            }
          });
          
          if (response.error) {
            console.error('Error sending verification email:', response.error);
            toast.error('Could not send verification email', {
              description: 'Your RSVP was recorded, but we could not send the verification email.'
            });
          } else {
            toast.success('RSVP Verification Email Sent', {
              description: 'Please check your email for verification instructions.'
            });
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          toast.error('Could not send verification email', {
            description: 'Your RSVP was recorded, but we could not send the verification email.'
          });
        }
      }
      
      toast.success('RSVP Successful!', {
        description: 'You have been added to the event attendee list.'
      });
      
      onClose();
    } catch (error) {
      console.error('RSVP error:', error);
      toast.error('Failed to RSVP', {
        description: 'There was a problem with your RSVP. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm your RSVP</DialogTitle>
          <DialogDescription>
            You're about to RSVP for "{event.title}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Event Date: {new Date(event.date).toLocaleDateString()} at {event.time}
          </p>
          <p className="text-sm text-muted-foreground">
            Location: {event.location_name}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            {user?.email ? 
              `A confirmation email and verification will be sent to ${user.email}` : 
              'Sign in to receive confirmation emails'}
          </p>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleRSVP} 
            disabled={isSubmitting} 
            className="bg-herd-purple hover:bg-herd-purple-dark"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Confirm RSVP'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RSVPDialog;
