import PersonalizacionHero from '@/app/shared/components/public/personalizacion/Hero';
import PersonalizacionPasos from '@/app/shared/components/public/personalizacion/Steps';
import PersonalizacionFormulario from '@/app/shared/components/public/personalizacion/Form';
import { getWhatsAppConfig } from '@/app/shared/services/config.service';

export default async function PersonalizacionPage() {
  const config = await getWhatsAppConfig();

  return (
    <main className="flex min-h-svh flex-col mt-0 md:mt-12">
      <PersonalizacionHero title="Personalización" />
      <PersonalizacionPasos />
      {config?.telefono ? (
        <PersonalizacionFormulario
          whatsappNumber={config.telefono}
          imageSrc="/image.png"
        />
      ) : (
        <div className="flex items-center justify-center py-16">
          <p className="font-dm-sans text-sm text-hard-brown/60">
            El formulario de personalización estará disponible próximamente.
          </p>
        </div>
      )}
    </main>
  );
}
