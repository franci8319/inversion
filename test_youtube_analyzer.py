#!/usr/bin/env python3
"""
test_youtube_analyzer.py

Script para testear localmente la extracción y análisis de videos
Ejecutar: python3 test_youtube_analyzer.py

REQUISITOS:
pip install youtube-transcript-api
pip install google-generativeai
pip install python-dotenv
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    import google.generativeai as genai
except ImportError:
    print("❌ Faltan dependencias. Instala con:")
    print("pip install youtube-transcript-api google-generativeai python-dotenv")
    sys.exit(1)

# Cargar variables de entorno
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("❌ GEMINI_API_KEY no configurada en .env.local")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)

# PROMPT PARA ANÁLISIS
ANALYSIS_PROMPT = """Eres un analista financiero experto en ondas de Elliott y ciclos de mercado, con el enfoque de José Luis Cava.

ACTIVOS PRINCIPALES: Bitcoin, S&P 500, Oro

CONTEXTO: El video trata sobre análisis de mercados financieros.

ESTRUCTURA DE ANÁLISIS:

1. TENDENCIA PRINCIPAL: ¿Alcista, bajista o neutral?
2. CICLO DE ELLIOTT: ¿En qué onda o fase?
3. FACTOR PSICOLÓGICO: ¿Manos débiles? ¿Limpieza técnica?
4. FACTORES MACROECONOMICOS: Tasas, liquidez, geopolítica
5. NIVELES TÉCNICOS: Soportes y resistencias
6. RIESGOS: Amenazas identificadas
7. RECOMENDACIÓN: COMPRA | VENTA | ESPERA | ACCUMULATE

RESPONDE SOLO CON JSON válido (sin markdown ni backticks).

Ejemplo de respuesta:
{
  "activo": "Bitcoin",
  "tendencia": "ALCISTA",
  "confianza": "ALTA",
  "recomendacion": "COMPRA",
  "sentiment_score": 8.5
}
"""


def get_video_id(url):
    """Extrae el ID de video de una URL de YouTube"""
    if "youtube.com/watch?v=" in url:
        return url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    else:
        return url  # Asumir que es el ID directo


def get_transcript(video_id, language="es"):
    """Obtiene la transcripción de un video"""
    try:
        print(f"🎬 Obteniendo transcripción de {video_id}...")
        transcript = YouTubeTranscriptApi.get_transcript(
            video_id,
            languages=[language]
        )
        
        # Combinar todo el texto
        full_text = " ".join([item["text"] for item in transcript])
        print(f"✅ Transcripción obtenida: {len(full_text)} caracteres")
        return full_text
        
    except Exception as e:
        print(f"❌ Error al obtener transcripción: {e}")
        return None


def analyze_transcript(transcript, video_title):
    """Analiza la transcripción con Gemini"""
    try:
        print(f"🤖 Analizando con Gemini...")
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
{ANALYSIS_PROMPT}

VIDEO: "{video_title}"

TRANSCRIPCIÓN (primeros 5000 caracteres):
{transcript[:5000]}

Responde SOLO con JSON válido.
"""
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Limpiar backticks si existen
        if response_text.startswith("```"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()
        
        print(f"✅ Análisis completado")
        return response_text
        
    except Exception as e:
        print(f"❌ Error en análisis: {e}")
        return None


def save_analysis(video_id, title, transcript, analysis):
    """Guarda el análisis en un archivo JSON"""
    try:
        import json
        
        # Parsear análisis si es string
        if isinstance(analysis, str):
            analysis_dict = json.loads(analysis)
        else:
            analysis_dict = analysis
        
        result = {
            "youtube_id": video_id,
            "title": title,
            "timestamp": datetime.now().isoformat(),
            "transcript_length": len(transcript),
            "analysis": analysis_dict
        }
        
        # Guardar en archivo
        filename = f"analysis_{video_id}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Análisis guardado en: {filename}")
        return filename
        
    except Exception as e:
        print(f"❌ Error al guardar: {e}")
        return None


def main():
    """Función principal"""
    print("=" * 60)
    print("🚀 YOUTUBE FINANCIAL ANALYZER - TESTER")
    print("=" * 60)
    
    # Ejemplos de videos para testear
    test_videos = [
        {
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "title": "Test Video 1"
        }
    ]
    
    print("\n📝 INSTRUCCIONES:")
    print("1. Reemplaza las URLs de arriba con videos reales de José Luis Cava")
    print("2. Puedes obtener los IDs directos de YouTube")
    print("3. El script extraerá la transcripción y analizará")
    
    print("\n🔗 VIDEOS PARA TESTEAR (actualiza estas URLs):")
    print("   • ¿Por qué soy alcista en Bitcoin?")
    print("   • ¿Por qué soy alcista en S&P500?")
    print("   • ¿Por qué soy alcista en ORO?")
    
    print("\n" + "=" * 60)
    
    # Opción interactiva
    user_url = input("\n🎯 Ingresa URL o ID de video (o ENTER para saltar): ").strip()
    
    if not user_url:
        print("\n❌ No se ingresó URL. Saliendo...")
        return
    
    video_id = get_video_id(user_url)
    video_title = input("📝 Título del video: ").strip() or "Video Análisis"
    
    # Paso 1: Obtener transcripción
    print("\n" + "=" * 60)
    print("PASO 1: EXTRAER TRANSCRIPCIÓN")
    print("=" * 60)
    
    transcript = get_transcript(video_id)
    if not transcript:
        print("❌ No se pudo obtener transcripción. ¿El video tiene subtítulos?")
        return
    
    print(f"Primeros 200 caracteres:")
    print(f'"{transcript[:200]}..."')
    
    # Paso 2: Analizar
    print("\n" + "=" * 60)
    print("PASO 2: ANALIZAR CON GEMINI")
    print("=" * 60)
    
    analysis = analyze_transcript(transcript, video_title)
    if not analysis:
        print("❌ Error en análisis")
        return
    
    print(f"\n📊 RESULTADO:")
    print(analysis)
    
    # Paso 3: Guardar
    print("\n" + "=" * 60)
    print("PASO 3: GUARDAR ANÁLISIS")
    print("=" * 60)
    
    filename = save_analysis(video_id, video_title, transcript, analysis)
    
    # Resumen
    print("\n" + "=" * 60)
    print("✅ PROCESO COMPLETADO")
    print("=" * 60)
    print(f"\n✓ Transcripción: {len(transcript)} caracteres")
    print(f"✓ Análisis guardado en: {filename}")
    print("\n💡 Ahora puedes:")
    print("  1. Revisar el JSON generado")
    print("  2. Ajustar el PROMPT si es necesario")
    print("  3. Probar con más videos")
    print("  4. Proceder al deployment")
    
    # Mostrar análisis formateado
    if filename:
        print(f"\n📋 VER ANÁLISIS:")
        print(f"  cat {filename}")


if __name__ == "__main__":
    main()
