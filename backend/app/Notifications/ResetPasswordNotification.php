<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;

    /**
     * Create a new notification instance.
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        $url = config('app.frontend_url') . '/reset-password?token=' . $this->token . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Réinitialisation du mot de passe / Password Reset / Restablecimiento de contraseña')
            ->greeting('Bonjour, Hello, Hola,')
            // Français
            ->line('**FRANÇAIS**')
            ->line('Bonjour ' . ($notifiable->first_name ?? '') . ',')
            ->line('Vous avez demandé la réinitialisation de votre mot de passe pour votre compte MerlApp.')
            ->action('Réinitialiser mon mot de passe', $url)
            ->line('Si vous n'avez pas fait cette demande, vous pouvez ignorer ce message.')
            ->line('Merci, à bientôt.')
            ->line('-----------------------------')
            // English
            ->line('**ENGLISH**')
            ->line('Hello ' . ($notifiable->first_name ?? '') . ',')
            ->line('You requested a password reset for your MerlApp account.')
            ->line('If you did not make this request, you can ignore this message.')
            ->line('Thank you, see you soon.')
            ->line('-----------------------------')
            // Español
            ->line('**ESPAÑOL**')
            ->line('Hola ' . ($notifiable->first_name ?? '') . ',')
            ->line('Ha solicitado restablecer la contraseña de su cuenta MerlApp.')
            ->line('Si no ha hecho esta solicitud, puede ignorar este mensaje.')
            ->line('Gracias, hasta pronto.')
            ->salutation('');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
