import { Phone, Mail, Clock } from 'lucide-react';

export default function FooterSection() {
    return (
        <footer className="bg-foreground text-background py-20 md:py-28 px-8 md:px-20">
            <div className="max-w-6xl mx-auto">
                {/* Top */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                            Comercializadora
                            <br />
                            <span className="text-primary">Rivera</span>
                        </h3>
                        <p className="text-background/40 text-sm leading-relaxed">
                            Soluciones integrales en acabados y decoración de interiores.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="space-y-6">
                        <p className="text-xs tracking-[0.2em] text-background/30 uppercase font-bold">
                            Contacto
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Phone size={14} className="text-primary mt-1 flex-shrink-0" />
                                <div className="text-sm text-background/70">
                                    <p>+52 56 29 67 18 69</p>
                                    <p>+52 55 79 16 78 44</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail size={14} className="text-primary mt-1 flex-shrink-0" />
                                <p className="text-sm text-background/70">jorgeri_1990@hotmail.com</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock size={14} className="text-primary mt-1 flex-shrink-0" />
                                <p className="text-sm text-background/70">
                                    Lunes a Viernes
                                    <br />
                                    9:00 AM — 10:00 PM
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-6">
                        <p className="text-xs tracking-[0.2em] text-background/30 uppercase font-bold">
                            Servicios
                        </p>
                        <div className="space-y-2 text-sm text-background/50">
                            <p>Pisos y Recubrimientos</p>
                            <p>Mantenimiento y Restauración</p>
                            <p>Decoración y Complementos</p>
                            <p>Molduras y Acabados</p>
                            <p>Tecnología y Confort</p>
                            <p>Persianas y Cortinas</p>
                        </div>
                    </div>
                </div>

                {/* Divider line — blueprint style */}
                <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <p className="text-xs text-background/20 tracking-wider">
                        © {new Date().getFullYear()} COMERCIALIZADORA RIVERA — TODOS LOS DERECHOS RESERVADOS
                    </p>
                    <p className="text-xs text-background/20 tracking-wider font-mono">
                        CDMX · MX
                    </p>
                </div>
            </div>
        </footer>
    );
}