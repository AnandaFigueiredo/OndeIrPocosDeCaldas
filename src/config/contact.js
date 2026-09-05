export const CONTACT = {
  whatsapp: '', // Preencher com DDI + DDD + número, apenas dígitos.
  instagram: 'https://www.instagram.com/ondeirpocosdecaldas/',
  email: '',
};
export const MESSAGE = 'Olá! Conheci o trabalho do Onde Ir Poços de Caldas pelo site e gostaria de saber mais sobre as opções de divulgação para o meu negócio.';
export const contactUrl = () => CONTACT.whatsapp
  ? `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(MESSAGE)}`
  : CONTACT.instagram;
