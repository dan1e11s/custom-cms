import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import type { ContactsBlockData } from '@/types/blocks'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'

export function ContactsBlock({ data }: { data: ContactsBlockData }) {
  return (
    <Section className="bg-gray-50">
      <Container>
        {data.heading && (
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">{data.heading}</h2>
        )}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Контактные данные */}
          <div className="flex flex-col gap-5">
            {data.address && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="text-gray-700">{data.address}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-3">
                <Phone className="size-5 shrink-0 text-primary" />
                <a
                  href={`tel:${data.phone.replace(/\D/g, '')}`}
                  className="text-gray-700 hover:text-primary"
                >
                  {data.phone}
                </a>
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-3">
                <Mail className="size-5 shrink-0 text-primary" />
                <a href={`mailto:${data.email}`} className="text-gray-700 hover:text-primary">
                  {data.email}
                </a>
              </div>
            )}
            {data.workingHours && (
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="text-gray-700">{data.workingHours}</span>
              </div>
            )}
            {data.socials && data.socials.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {data.socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-primary hover:text-primary"
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Карта */}
          {data.mapEmbed && (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <iframe
                src={data.mapEmbed}
                width="100%"
                height="350"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block"
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
