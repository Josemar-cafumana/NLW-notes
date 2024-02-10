import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";
import { useRef } from "react";

type Props = {
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null;

export const NewNoteCard = ({ onNoteCreated  }: Props) => {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [isRecording, setIsRecording] = useState(false)
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false)
  const contentTextArea = useRef<HTMLTextAreaElement>(null)

  const handleStartEditor = () => {
    setShouldShowOnboarding(false);
  };

  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);

    if (event.target.value == "") {
      setShouldShowOnboarding(true);
    }
  };

  const handleSaveNote = (event: FormEvent) => {
    event.preventDefault();

    if(content == '') {
      toast.error("Informe o conteúdo da nota");
      return;
    }

    onNoteCreated(content)

    setContent('')
    setShouldShowOnboarding(true);
    setIsOpen(false)

    toast.success("Nota criada com sucesso");
  };

  const handleStartRecording = () => {
    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window
    || 'webkitSpeechRecognition'  in window

    if(!isSpeechRecognitionAPIAvailable) {
      toast.error("Infelizmente seu navegador não suporta a API de reconhecimento!");
      return;
    }

    setIsRecording(true)
    setShouldShowOnboarding(false)

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true
    
    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')

      setContent(transcription)
    }

    speechRecognition.onerror = (event) => {
      toast.error("Ocorreu um erro com a API de reconhecimento!");
      contentTextArea.current?.focus()
      setIsRecording(false)
      setShouldShowOnboarding(true)
      console.log(event)
    }

    speechRecognition.start()


  }

  const handleStopRecording = () => {
    setIsRecording(false)

    if(speechRecognition !== null) {
      speechRecognition.stop()
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen} >
      <Dialog.Trigger className="flex flex-col text-left rounded-md bg-slate-700 p-5 space-y-3 overflow-hidden relative hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <span className="text-sm font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertido para texto
          automáticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/60" />
        <Dialog.Content className="fixed inset-0 md:inset-auto md:-translate-x-1/2 md:-translate-y-1/2 md:left-1/2 md:top-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 rounded-md flex flex-col outline-none">
          <Dialog.Close className="absolute top-0 right-0 p-1.5 bg-slate-800 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>

          <form  className="flex-1 flex flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5 overflow-y-auto">
              <span className="text-sm font-medium text-slate-200">
                Adicionar nota
              </span>
              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400">
                  Comece{" "}
                  <button type="button" onClick={handleStartRecording} className="text-lime-400 hover:text-lime-500">
                    gravando uma nota
                  </button>{" "}
                  em áudio ou se preferir{" "}
                  <button
                    type="button"
                    onClick={handleStartEditor}
                    className="text-lime-400 hover:text-lime-500"
                  >
                    utilize apenas texto.
                  </button>
                </p>
              ) : (
                <textarea
                  ref={contentTextArea}
                  autoFocus
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                  onChange={handleContentChange}
                  value={content}
                />
              )}
            </div>

            {isRecording ? (
               <button
               type="button"
               onClick={handleStopRecording}
               className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-350 font-medium outline-none hover:text-slate-100"
             >
              <div className="size-3 rounded-full bg-red-500 animate-pulse" />
               Gravando! (clique p/ interromper)
             </button>
            ) : (
              <button
              type="button"
              onClick={handleSaveNote}
              className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 font-medium outline-none hover:bg-lime-500"
            >
              Salvar
            </button>
            )}
           
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
