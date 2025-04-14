<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TwoFactorCodeNotification extends Notification
{
    use Queueable;

    protected $twoFactorCode;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $twoFactorCode)
    {
        $this->twoFactorCode = $twoFactorCode;
    }
    

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Code de vérification / Verification Code / Código de verificación')
            ->greeting('Bonjour, Hello, Hola,')
            ->line('**FRANÇAIS**')
            ->line('Bonjour ' . $notifiable->prenom . ',')
            ->line('Voici votre code de vérification pour accéder à votre compte :')
            ->line('**' . $this->twoFactorCode . '**')
            ->line('Ce code expirera dans 10 minutes.')
            ->line('Merci, à bientôt.')
            ->line('-----------------------------')
            ->line('**ENGLISH**')
            ->line('Hello ' . $notifiable->prenom . ',')
            ->line('Here is your verification code to access your account:')
            ->line('**' . $this->twoFactorCode . '**')
            ->line('This code will expire in 10 minutes.')
            ->line('Thank you, see you soon.')
            ->line('-----------------------------')
            ->line('**ESPAÑOL**')
            ->line('Hola ' . $notifiable->prenom . ',')
            ->line('Este es tu código de verificación para acceder a tu cuenta:')
            ->line('**' . $this->twoFactorCode . '**')
            ->line('Este código expirará en 10 minutos.')
            ->line('Gracias, hasta pronto.');
    }


    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
