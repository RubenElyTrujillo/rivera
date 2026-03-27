import { useState } from 'react';
import { ArrowRight, ArrowLeft, MessageCircle } from 'lucide-react';
import * as motion from 'motion/react-client';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { IContactInfo } from '@/interfaces';

const DEFAULT_SURFACE_TYPES = [
    'Piso de Madera de Ingeniería',
    'Piso Laminado',
    'Piso Vinílico SPC',
    'Deck Sintético',
    'Lambrines / Muros',
    'Persianas / Cortinas',
    'Restauración / Pulido',
    'Molduras',
    'Otro',
];

export default function ContactSection({ contact }: { contact?: IContactInfo | null }) {
    const whatsappPhone = contact?.whatsappPhone ?? '525629671869';
    const surfaceOptions = contact?.surfaceOptions?.length ? contact.surfaceOptions : DEFAULT_SURFACE_TYPES;

    const [step, setStep] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        surface: '',
        area: '',
        location: '',
        message: '',
    });

    const updateField = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        `Hola, me interesa cotizar: ${formData.surface || 'un servicio'}. Área aprox: ${formData.area || 'por definir'}. ${formData.message || ''}`
    )}`;

    async function handleSubmit() {
        setSending(true);
        try {
            await fetch('/api/quotation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
        } catch {
            // Si falla, no bloqueamos al usuario — puede usar WhatsApp como respaldo
        }
        setSending(false);
        setSubmitted(true);
    }

    const steps = [
        // Step 0: Type
        <div key="0" className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight">¿Qué tipo de superficie necesitas?</h3>
            <Select value={formData.surface} onValueChange={(v: string) => updateField('surface', v)}>
                <SelectTrigger className="bg-transparent border-foreground/20 h-14 text-base">
                    <SelectValue placeholder="Selecciona el tipo de superficie" />
                </SelectTrigger>
                <SelectContent>
                    {surfaceOptions.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>,

        // Step 1: Details
        <div key="1" className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight">Detalles del proyecto</h3>
            <Input
                placeholder="Metros cuadrados aproximados"
                value={formData.area}
                onChange={(e) => updateField('area', e.target.value)}
                className="bg-transparent border-foreground/20 h-14 text-base"
            />
            <Input
                placeholder="Ubicación (Ciudad / Zona)"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                className="bg-transparent border-foreground/20 h-14 text-base"
            />
        </div>,

        // Step 2: Contact
        <div key="2" className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight">Tus datos de contacto</h3>
            <Input
                placeholder="Nombre completo"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="bg-transparent border-foreground/20 h-14 text-base"
            />
            <Input
                placeholder="Teléfono o WhatsApp"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="bg-transparent border-foreground/20 h-14 text-base"
            />
            <Textarea
                placeholder="Mensaje adicional (opcional)"
                value={formData.message}
                onChange={(e) => updateField('message', e.target.value)}
                className="bg-transparent border-foreground/20 text-base min-h-20"
            />
        </div>,
    ];

    return (
        <section id="contacto" className="py-24 md:py-36 px-8 md:px-20 bg-background">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                {/* Left */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <p className="text-primary text-xs tracking-[0.3em] uppercase font-semibold mb-3">
                        COMIENZA TU PROYECTO
                    </p>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-6">
                        Cotiza ahora
                    </h2>
                    <p className="text-muted-foreground text-base leading-relaxed mb-10">
                        Cuéntanos sobre tu proyecto y te asesoramos sin compromiso. Atención personalizada para elegir el material correcto.
                    </p>

                    {/* WhatsApp CTA */}
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 text-sm font-bold tracking-wider uppercase hover:bg-[#20bd5a] transition-colors"
                    >
                        <MessageCircle size={20} />
                        COTIZAR POR WHATSAPP
                    </a>
                </motion.div>

                {/* Right: Multi-step form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {submitted ? (
                        <div className="py-12 text-center space-y-4">
                            <p className="text-2xl font-bold tracking-tight text-foreground">¡Mensaje enviado!</p>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Recibimos tu solicitud. Te contactaremos pronto.
                            </p>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 text-sm font-bold tracking-wider hover:bg-[#20bd5a] transition-colors mt-4"
                            >
                                <MessageCircle size={18} />
                                También puedes escribirnos por WhatsApp
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* Progress */}
                            <div className="flex gap-2 mb-8">
                                {[0, 1, 2].map((s) => (
                                    <div
                                        key={s}
                                        className={`h-1 flex-1 transition-colors duration-300 ${s <= step ? 'bg-primary' : 'bg-border'
                                            }`}
                                    />
                                ))}
                            </div>

                            <p className="text-xs text-muted-foreground tracking-wider uppercase mb-6">
                                Paso {step + 1} de 3
                            </p>

                            {steps[step]}

                            {/* Navigation */}
                            <div className="flex justify-between mt-8">
                                <button
                                    onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                                    disabled={step === 0}
                                    className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Anterior
                                </button>

                                {step < 2 ? (
                                    <button
                                        onClick={() => setStep((prev) => prev + 1)}
                                        className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                                    >
                                        Siguiente
                                        <ArrowRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => void handleSubmit()}
                                        disabled={sending}
                                        className="flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-bold tracking-wider hover:bg-primary transition-colors disabled:opacity-50"
                                    >
                                        {sending ? 'ENVIANDO...' : 'ENVIAR'}
                                        <ArrowRight size={16} />
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </section>
    );
}