<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class UserCreatedNotification extends Notification
{
    use Queueable;

    protected string $email;
    protected string $password;

    public function __construct(string $email, string $password)
    {
        $this->email = $email;
        $this->password = $password;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre compte a été créé / Your account has been created / Su cuenta ha sido creada')
            ->greeting('Bonjour, Hello, Hola,')
            
            // Français
            ->line('**FRANÇAIS**')
            ->line('Un administrateur a créé un compte pour vous.')
            ->line('Voici vos identifiants de connexion :')
            ->line('Email : ' . $this->email)
            ->line('Mot de passe : ' . $this->password)
            ->line('Veuillez vous connecter et modifier votre mot de passe dès que possible.')
            ->line('-----------------------------')

            // English
            ->line('**ENGLISH**')
            ->line('An administrator has created an account for you.')
            ->line('Here are your login credentials:')
            ->line('Email: ' . $this->email)
            ->line('Password: ' . $this->password)
            ->line('Please log in and change your password as soon as possible.')
            ->line('-----------------------------')

            // Español
            ->line('**ESPAÑOL**')
            ->line('Un administrador ha creado una cuenta para usted.')
            ->line('Aquí están sus credenciales de inicio de sesión:')
            ->line('Correo electrónico: ' . $this->email)
            ->line('Contraseña: ' . $this->password)
            ->line('Por favor, inicie sesión y cambie su contraseña lo antes posible.');
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
