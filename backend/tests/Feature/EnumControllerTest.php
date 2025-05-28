<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EnumControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
    }

    /** @test */
    public function it_returns_all_enums()
    {
        $this->authenticate();

        $response = $this->getJson('/api/enums');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'type', 'zone', 'sexe', 'genre', 'role'
                 ]);
    }

    /** @test */
    public function it_contains_known_value_for_type_enum()
    {
        $this->authenticate();

        $response = $this->getJson('/api/enums');

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'value' => 'child',
                     'label' => __('type.child'),
                 ]);
    }

    /** @test */
    public function it_contains_known_value_for_zone_enum()
    {
        $this->authenticate();

        $response = $this->getJson('/api/enums');

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'value' => 'urban',
                     'label' => __('zone.urban'),
                 ]);
    }

    /** @test */
    public function it_contains_known_value_for_sexe_enum()
    {
        $this->authenticate();

        $response = $this->getJson('/api/enums');

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'value' => 'male',
                     'label' => __('sexe.male'),
                 ]);
    }

    /** @test */
    public function it_contains_known_value_for_genre_enum()
    {
        $this->authenticate();

        $response = $this->getJson('/api/enums');

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'value' => 'cis_hetero',
                     'label' => __('genre.cis_hetero'),
                 ]);
    }

    /** @test */
    public function it_contains_known_value_for_role_enum()
    {
        $this->authenticate();

        $response = $this->getJson('/api/enums');

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'value' => 'utilisateur',
                     'label' => __('role.utilisateur'),
                 ]);
    }
}
