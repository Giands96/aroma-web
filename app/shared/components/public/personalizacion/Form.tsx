"use client";

import Image from "next/image";
import { FormEvent, InputHTMLAttributes } from "react";
import { MoveUpRight } from "lucide-react";
import Reveal from "@/app/shared/components/ui/Reveal";

interface PersonalizacionFormularioProps {
  whatsappNumber: string;
  imageSrc?: string;
  imageAlt?: string;
}

const fieldContainerClassName = `
  border-b border-hard-brown/30
  px-6 py-7
  sm:odd:border-r
  md:px-8 md:py-9
  lg:px-10
`;

const controlClassName = `
  mt-4 block w-full
  border-0 bg-transparent p-0
  font-dm-sans text-base text-hard-brown
  outline-none
  placeholder:text-hard-brown/60
  focus-visible:ring-0 
`;

export default function PersonalizacionFormulario({
  whatsappNumber,
  imageSrc = "/image.png",
  imageAlt = "Presentación personalizada de una vela Aroma",
}: PersonalizacionFormularioProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const normalizedNumber = whatsappNumber.replace(/\D/g, "");

    if (!normalizedNumber) {
      console.error("El número de WhatsApp no es válido.");
      return;
    }

    const getValue = (name: string): string => {
      const value = formData.get(name);

      return typeof value === "string" ? value.trim() : "";
    };

    const message = [
      "Hola, quisiera solicitar una cotización para una vela personalizada.",
      "",
      `Nombre: ${getValue("name")}`,
      `WhatsApp: ${getValue("phone")}`,
      `Tipo de pedido: ${getValue("orderType")}`,
      `Cantidad aproximada: ${getValue("quantity")}`,
      `Aroma preferido: ${getValue("fragrance") || "Por definir"}`,
      `Fecha requerida: ${getValue("requiredDate") || "Por definir"}`,
      "",
      "Idea o detalles:",
      getValue("message"),
    ].join("\n");

    const whatsappUrl = `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      aria-labelledby="personalization-form-title"
      className="w-full border-y  border-hard-brown/30 bg-[#FCFAF7] text-hard-brown"
    >
      <div className=" grid w-full grid-cols-1 md:grid-cols-12">
        {/* Presentación */}
        <article className="flex flex-col border-b border-hard-brown/30 md:col-span-5 md:border-b-0 md:border-r">
          <Reveal>
          <div className="px-6 py-12 md:px-10 md:py-16 lg:px-14">
            <span className="font-dm-sans font-semibold text-[0.8rem] uppercase tracking-[0.24em] text-hard-brown/60">
              Solicitud personalizada
            </span>

            <h2
              id="personalization-form-title"
              className="mt-5 max-w-[9ch] font-mileast text-[clamp(3.5rem,6vw,7rem)] font-normal leading-[0.84] tracking-[-0.05em]"
            >
              Cuéntanos tu idea
            </h2>

            <div
              aria-hidden="true"
              className="my-7 h-px w-24 bg-hard-brown/40"
            />

            <p className="max-w-md font-dm-sans text-base leading-7 text-hard-brown/70">
              Comparte los detalles principales de tu proyecto. Te ayudaremos
              a definir el aroma, la presentación y los acabados de tu vela.
            </p>
          </div>
          </Reveal>

          <figure className="relative mt-auto aspect-[4/3] overflow-hidden border-t border-hard-brown/30">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 767px) 100vw, 42vw"
              className="object-cover object-center"
            />

            <figcaption className="absolute bottom-0 left-0 border-r border-t border-hard-brown/30 bg-[#FCFAF7] px-4 py-3 font-dm-sans text-[0.6rem] uppercase tracking-[0.18em]">
              Creado alrededor de tu historia
            </figcaption>
          </figure>
        </article>

        {/* Formulario */}
        <div className="md:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="grid h-full grid-cols-1 sm:grid-cols-2"
          >
            <FormField
              id="name"
              name="name"
              label="Nombre"
              placeholder="Tu nombre"
              autoComplete="name"
              required
            />

            <FormField
              id="phone"
              name="phone"
              label="WhatsApp"
              placeholder="+51 999 999 999"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
            />

            <div className={fieldContainerClassName}>
              <label
                htmlFor="orderType"
                className="font-dm-sans text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-hard-brown/60"
              >
                Tipo de pedido
              </label>

              <select
                id="orderType"
                name="orderType"
                required
                defaultValue=""
                className={`${controlClassName} cursor-pointer`}
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>

                <option value="Regalo personalizado">
                  Regalo personalizado
                </option>

                <option value="Boda">Boda</option>
                <option value="Cumpleaños">Cumpleaños</option>
                <option value="Evento corporativo">
                  Evento corporativo
                </option>

                <option value="Decoración">Decoración</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <FormField
              id="quantity"
              name="quantity"
              label="Cantidad aproximada"
              placeholder="Ej. 20 unidades"
              type="number"
              inputMode="numeric"
              min={1}
              required
            />

            <FormField
              id="fragrance"
              name="fragrance"
              label="Aroma preferido"
              placeholder="Vainilla, lavanda, sándalo..."
            />

            <FormField
              id="requiredDate"
              name="requiredDate"
              label="Fecha requerida"
              type="date"
            />

            <div className="border-b border-hard-brown/30 px-6 py-7 sm:col-span-2 md:px-8 md:py-9 lg:px-10">
              <label
                htmlFor="message"
                className="font-dm-sans text-[0.65rem] uppercase tracking-[0.2em] text-hard-brown/60"
              >
                Cuéntanos tu idea
              </label>

              <textarea
                id="message"
                name="message"
                rows={6}
                required
                placeholder="Describe la ocasión, los colores, el estilo o cualquier detalle importante."
                className={`${controlClassName} min-h-40 resize-y leading-7`}
              />
            </div>

            <div className="flex items-start gap-3 border-b border-hard-brown/30 px-6 py-6 sm:col-span-2 md:px-8 lg:px-10">
              <input
                id="contactConsent"
                name="contactConsent"
                type="checkbox"
                required
                className="mt-1 size-4 shrink-0 accent-hard-brown"
              />

              <label
                htmlFor="contactConsent"
                className="max-w-2xl font-dm-sans text-xs leading-5 text-hard-brown/65"
              >
                Autorizo que Aroma me contacte mediante WhatsApp para atender
                esta solicitud.
              </label>
            </div>

            <button
              type="submit"
              className="group flex min-h-24 items-center justify-between bg-hard-brown px-6 py-6 font-dm-sans text-xs uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-white sm:col-span-2 md:px-8 lg:px-10"
            >
              Solicitar presupuesto

              <MoveUpRight
                aria-hidden="true"
                className="size-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  id: string;
  name: string;
  label: string;
}

function FormField({
  id,
  name,
  label,
  type = "text",
  ...inputProps
}: FormFieldProps) {
  return (
    <div className={fieldContainerClassName}>
      <label
        htmlFor={id}
        className="font-dm-sans text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-hard-brown/60"
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        className={controlClassName}
        {...inputProps}
      />
    </div>
  );
}