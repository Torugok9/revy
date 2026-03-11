#!/usr/bin/env python3
"""
Gera o PDF: Guia Completo de Configuração RevenueCat + App Store + Google Play
Personalizado para o app Revvy (com.beecodeit.revy)
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus.flowables import Flowable
import os

# ── Colors ──
PRIMARY = HexColor("#1a1a2e")
ACCENT = HexColor("#6C63FF")
ACCENT_LIGHT = HexColor("#E8E6FF")
SUCCESS = HexColor("#10B981")
WARNING = HexColor("#F59E0B")
DANGER = HexColor("#EF4444")
GRAY_50 = HexColor("#F9FAFB")
GRAY_100 = HexColor("#F3F4F6")
GRAY_200 = HexColor("#E5E7EB")
GRAY_300 = HexColor("#D1D5DB")
GRAY_500 = HexColor("#6B7280")
GRAY_700 = HexColor("#374151")
GRAY_900 = HexColor("#111827")

OUTPUT_PATH = "/sessions/confident-exciting-knuth/mnt/revy/Guia_RevenueCat_Revvy.pdf"


# ── Custom Flowables ──

class RoundedBox(Flowable):
    """A colored rounded box with content."""
    def __init__(self, width, content_lines, bg_color, text_color=GRAY_900,
                 border_color=None, icon="", title="", padding=10):
        super().__init__()
        self.box_width = width
        self.content_lines = content_lines
        self.bg_color = bg_color
        self.text_color = text_color
        self.border_color = border_color or bg_color
        self.icon = icon
        self.title = title
        self.padding = padding
        self.line_height = 16
        title_lines = 1 if title else 0
        self.height = (len(content_lines) + title_lines) * self.line_height + self.padding * 2 + 4

    def draw(self):
        self.canv.saveState()
        self.canv.setFillColor(self.bg_color)
        self.canv.setStrokeColor(self.border_color)
        self.canv.setLineWidth(0.5)
        self.canv.roundRect(0, 0, self.box_width, self.height, 6, fill=1, stroke=1)

        y = self.height - self.padding - 12
        if self.title:
            self.canv.setFont("Helvetica-Bold", 10)
            self.canv.setFillColor(self.text_color)
            label = f"{self.icon}  {self.title}" if self.icon else self.title
            self.canv.drawString(self.padding, y, label)
            y -= self.line_height + 2

        self.canv.setFont("Helvetica", 9)
        self.canv.setFillColor(self.text_color)
        for line in self.content_lines:
            if line.startswith("**"):
                self.canv.setFont("Helvetica-Bold", 9)
                line = line.replace("**", "")
            else:
                self.canv.setFont("Helvetica", 9)
            self.canv.drawString(self.padding + 4, y, line)
            y -= self.line_height
        self.canv.restoreState()


class StepNumber(Flowable):
    """Numbered step circle."""
    def __init__(self, number, size=28):
        super().__init__()
        self.number = str(number)
        self.size = size
        self.width = size
        self.height = size

    def draw(self):
        self.canv.saveState()
        self.canv.setFillColor(ACCENT)
        self.canv.circle(self.size/2, self.size/2, self.size/2, fill=1, stroke=0)
        self.canv.setFillColor(white)
        self.canv.setFont("Helvetica-Bold", 14)
        tw = self.canv.stringWidth(self.number, "Helvetica-Bold", 14)
        self.canv.drawString(self.size/2 - tw/2, self.size/2 - 5, self.number)
        self.canv.restoreState()


class ProgressBar(Flowable):
    """Visual progress bar."""
    def __init__(self, width, steps, current_label=""):
        super().__init__()
        self.bar_width = width
        self.steps = steps
        self.height = 40
        self.current_label = current_label

    def draw(self):
        self.canv.saveState()
        bar_h = 8
        y = self.height / 2
        # Background
        self.canv.setFillColor(GRAY_200)
        self.canv.roundRect(0, y - bar_h/2, self.bar_width, bar_h, 4, fill=1, stroke=0)

        step_w = self.bar_width / len(self.steps)
        for i, (label, done) in enumerate(self.steps):
            cx = i * step_w + step_w / 2
            # Dot
            color = SUCCESS if done else GRAY_300
            self.canv.setFillColor(color)
            self.canv.circle(cx, y, 6, fill=1, stroke=0)
            # Label
            self.canv.setFillColor(GRAY_700 if done else GRAY_500)
            self.canv.setFont("Helvetica", 6.5)
            tw = self.canv.stringWidth(label, "Helvetica", 6.5)
            self.canv.drawString(cx - tw/2, y - 16, label)

        self.canv.restoreState()


# ── Styles ──

def get_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        'DocTitle', parent=styles['Title'],
        fontSize=26, leading=32, textColor=PRIMARY,
        spaceAfter=4, fontName='Helvetica-Bold', alignment=TA_LEFT
    ))
    styles.add(ParagraphStyle(
        'DocSubtitle', parent=styles['Normal'],
        fontSize=12, leading=16, textColor=GRAY_500,
        spaceAfter=20, fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'SectionTitle', parent=styles['Heading1'],
        fontSize=18, leading=24, textColor=PRIMARY,
        spaceBefore=24, spaceAfter=12, fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'StepTitle', parent=styles['Heading2'],
        fontSize=14, leading=18, textColor=GRAY_900,
        spaceBefore=16, spaceAfter=8, fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'SubStep', parent=styles['Heading3'],
        fontSize=11, leading=15, textColor=GRAY_700,
        spaceBefore=10, spaceAfter=6, fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'Body', parent=styles['Normal'],
        fontSize=10, leading=15, textColor=GRAY_700,
        spaceAfter=6, fontName='Helvetica', alignment=TA_JUSTIFY
    ))
    styles.add(ParagraphStyle(
        'BodyBold', parent=styles['Normal'],
        fontSize=10, leading=15, textColor=GRAY_900,
        spaceAfter=6, fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'CodeBlock', parent=styles['Normal'],
        fontSize=9, leading=13, textColor=GRAY_900,
        fontName='Courier', backColor=GRAY_100,
        leftIndent=12, rightIndent=12,
        spaceBefore=4, spaceAfter=4,
        borderPadding=(6, 8, 6, 8)
    ))
    styles.add(ParagraphStyle(
        'SmallNote', parent=styles['Normal'],
        fontSize=8.5, leading=12, textColor=GRAY_500,
        fontName='Helvetica-Oblique', spaceAfter=4
    ))
    styles.add(ParagraphStyle(
        'CheckItem', parent=styles['Normal'],
        fontSize=10, leading=15, textColor=GRAY_700,
        fontName='Helvetica', leftIndent=20, spaceAfter=4
    ))
    styles.add(ParagraphStyle(
        'TableHeader', parent=styles['Normal'],
        fontSize=9, leading=12, textColor=white,
        fontName='Helvetica-Bold', alignment=TA_CENTER
    ))
    styles.add(ParagraphStyle(
        'TableCell', parent=styles['Normal'],
        fontSize=9, leading=12, textColor=GRAY_700,
        fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'TableCellBold', parent=styles['Normal'],
        fontSize=9, leading=12, textColor=GRAY_900,
        fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'TOCEntry', parent=styles['Normal'],
        fontSize=11, leading=20, textColor=ACCENT,
        fontName='Helvetica', leftIndent=8
    ))
    return styles


# ── Helper functions ──

def make_info_box(width, title, lines, icon=""):
    return RoundedBox(width, lines, ACCENT_LIGHT, GRAY_900,
                      border_color=HexColor("#C7C3FF"), icon=icon, title=title)

def make_warning_box(width, title, lines):
    bg = HexColor("#FEF3C7")
    border = HexColor("#FCD34D")
    return RoundedBox(width, lines, bg, GRAY_900, border_color=border,
                      icon="!", title=title)

def make_success_box(width, title, lines):
    bg = HexColor("#D1FAE5")
    border = HexColor("#6EE7B7")
    return RoundedBox(width, lines, bg, GRAY_900, border_color=border, title=title)

def make_danger_box(width, title, lines):
    bg = HexColor("#FEE2E2")
    border = HexColor("#FCA5A5")
    return RoundedBox(width, lines, bg, GRAY_900, border_color=border,
                      icon="X", title=title)

def bullet(text, s):
    return Paragraph(f"&bull;&nbsp;&nbsp;{text}", s['Body'])

def check(text, s):
    return Paragraph(f"<font color='#10B981'>&#10003;</font>&nbsp;&nbsp;{text}", s['CheckItem'])

def numbered(n, text, s):
    return Paragraph(f"<b>{n}.</b>&nbsp;&nbsp;{text}", s['Body'])

def code_block(text, s):
    return Paragraph(text.replace("\n", "<br/>"), s['CodeBlock'])

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=GRAY_200,
                       spaceBefore=8, spaceAfter=8)

def section_divider():
    return Spacer(1, 6)


# ── PDF Builder ──

def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    s = get_styles()
    story = []
    w = doc.width

    # ════════════════════════════════════════
    # COVER / HEADER
    # ════════════════════════════════════════
    story.append(Spacer(1, 1.5*cm))
    story.append(Paragraph("Guia Completo de Configuracao", s['DocTitle']))
    story.append(Paragraph("RevenueCat + App Store + Google Play", s['DocTitle']))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Personalizado para o app Revvy (com.beecodeit.revy)", s['DocSubtitle']))

    story.append(Spacer(1, 8))

    # App info box
    story.append(make_info_box(w, "Dados do seu App", [
        "**App: Revvy",
        "**Bundle ID: com.beecodeit.revy",
        "**Entitlement: Revvy Pro",
        "**Planos: Free / Pro (mensal R$ 14,90 | anual R$ 119,90)",
        "**SDK: react-native-purchases v9.10.4",
    ], icon="i"))

    story.append(Spacer(1, 12))

    # Progress overview
    story.append(ProgressBar(w, [
        ("App Store Connect", False),
        ("Google Play Console", False),
        ("RevenueCat Dashboard", False),
        ("Testar Sandbox", False),
        ("Producao", False),
    ]))

    story.append(Spacer(1, 16))

    # TOC
    story.append(Paragraph("<b>Indice</b>", s['SectionTitle']))
    toc_items = [
        "1. Configuracao na App Store Connect (iOS)",
        "2. Configuracao no Google Play Console (Android)",
        "3. Configuracao no RevenueCat Dashboard",
        "4. Conectar as Lojas ao RevenueCat",
        "5. Criar Produtos no RevenueCat",
        "6. Criar Entitlement e Offering",
        "7. Trocar API Key de Teste para Producao",
        "8. Testar em Sandbox",
        "9. Checklist Final antes de Publicar",
    ]
    for item in toc_items:
        story.append(Paragraph(item, s['TOCEntry']))

    story.append(PageBreak())

    # ════════════════════════════════════════
    # SECTION 1: APP STORE CONNECT
    # ════════════════════════════════════════
    story.append(Paragraph("1. Configuracao na App Store Connect (iOS)", s['SectionTitle']))
    story.append(hr())

    story.append(Paragraph("Voce precisa criar os produtos de assinatura no App Store Connect antes de configura-los no RevenueCat.", s['Body']))

    # Step 1.1
    story.append(Paragraph("1.1 Criar o App (se ainda nao existe)", s['StepTitle']))
    story.append(numbered(1, "Acesse <b>appstoreconnect.apple.com</b> e faca login", s))
    story.append(numbered(2, "Va em <b>My Apps</b> e clique em <b>+</b> > <b>New App</b>", s))
    story.append(numbered(3, "Preencha:", s))

    fields_data = [
        ["Campo", "Valor"],
        ["Platform", "iOS"],
        ["Name", "Revvy"],
        ["Primary Language", "Portuguese (Brazil)"],
        ["Bundle ID", "com.beecodeit.revy"],
        ["SKU", "com-beecodeit-revy"],
    ]
    t = Table(fields_data, colWidths=[w*0.3, w*0.6])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, -1), GRAY_50),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    # Step 1.2
    story.append(Paragraph("1.2 Configurar Assinaturas (Subscriptions)", s['StepTitle']))
    story.append(numbered(1, "No seu app, va em <b>Monetization</b> > <b>Subscriptions</b>", s))
    story.append(numbered(2, "Clique em <b>+</b> para criar um <b>Subscription Group</b>", s))
    story.append(Spacer(1, 4))

    story.append(make_info_box(w, "Subscription Group", [
        "**Nome do grupo: Revvy Pro",
        "Este grupo vai conter os dois produtos (mensal e anual).",
        "Produtos no mesmo grupo permitem upgrade/downgrade automatico.",
    ]))
    story.append(Spacer(1, 8))

    story.append(numbered(3, "Dentro do grupo, clique em <b>+</b> para criar o primeiro produto:", s))
    story.append(Spacer(1, 4))

    # Monthly product
    monthly_data = [
        ["Campo", "Valor"],
        ["Reference Name", "Revvy Pro Mensal"],
        ["Product ID", "revvy_pro_monthly"],
        ["Subscription Duration", "1 Month"],
        ["Subscription Price", "R$ 14,90 (BRL)"],
        ["Localizations", "Display Name: Pro Mensal | Description: Acesso completo ao Revvy Pro"],
    ]
    t = Table(monthly_data, colWidths=[w*0.3, w*0.6])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, -1), GRAY_50),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(Paragraph("<b>Produto Mensal:</b>", s['BodyBold']))
    story.append(t)
    story.append(Spacer(1, 8))

    # Annual product
    story.append(numbered(4, "Crie o segundo produto no mesmo grupo:", s))
    story.append(Spacer(1, 4))
    annual_data = [
        ["Campo", "Valor"],
        ["Reference Name", "Revvy Pro Anual"],
        ["Product ID", "revvy_pro_annual"],
        ["Subscription Duration", "1 Year"],
        ["Subscription Price", "R$ 119,90 (BRL)"],
        ["Localizations", "Display Name: Pro Anual | Description: Acesso completo ao Revvy Pro - economia de 33%"],
    ]
    t = Table(annual_data, colWidths=[w*0.3, w*0.6])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, -1), GRAY_50),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(Paragraph("<b>Produto Anual:</b>", s['BodyBold']))
    story.append(t)
    story.append(Spacer(1, 10))

    # Step 1.3
    story.append(Paragraph("1.3 Configurar Precos para Todas as Regioes", s['StepTitle']))
    story.append(Paragraph("Ao definir o preco em BRL, a Apple automaticamente sugere precos equivalentes para outros paises. Revise a tabela e ajuste se necessario.", s['Body']))
    story.append(Spacer(1, 4))
    story.append(make_warning_box(w, "Atencao: App Store Pricing", [
        "A Apple usa uma tabela de precos pre-definida (price tiers).",
        "R$ 14,90 pode ser arredondado para o tier mais proximo.",
        "Verifique o preco final exato apos selecionar o tier.",
    ]))
    story.append(Spacer(1, 8))

    # Step 1.4
    story.append(Paragraph("1.4 Configurar App Store Server Notifications (Opcional, Recomendado)", s['StepTitle']))
    story.append(Paragraph("Isso permite que o RevenueCat receba eventos em tempo real da Apple (renovacoes, cancelamentos, reembolsos).", s['Body']))
    story.append(numbered(1, "No App Store Connect, va em <b>General</b> > <b>App Information</b>", s))
    story.append(numbered(2, "Role ate <b>App Store Server Notifications</b>", s))
    story.append(numbered(3, "Em <b>Production Server URL</b>, cole:", s))
    story.append(code_block("https://api.revenuecat.com/v1/subscribers/apple/notifications", s))
    story.append(numbered(4, "Em <b>Sandbox Server URL</b>, cole a mesma URL", s))
    story.append(numbered(5, "Selecione <b>Version 2 Notifications</b>", s))

    story.append(Spacer(1, 6))
    story.append(make_success_box(w, "Resultado", [
        "RevenueCat recebera eventos em tempo real da Apple.",
        "Cancelamentos e renovacoes serao refletidos instantaneamente.",
    ]))

    # Step 1.5
    story.append(Spacer(1, 8))
    story.append(Paragraph("1.5 Shared Secret", s['StepTitle']))
    story.append(Paragraph("O RevenueCat precisa do Shared Secret para validar recibos da Apple.", s['Body']))
    story.append(numbered(1, "No App Store Connect, va em <b>General</b> > <b>App Information</b> (antigo) ou <b>Users and Access</b> > <b>Integrations</b> > <b>In-App Purchase</b> (novo)", s))
    story.append(numbered(2, "Clique em <b>App-Specific Shared Secret</b> > <b>Generate</b>", s))
    story.append(numbered(3, "Copie o shared secret gerado (voce vai usa-lo no passo 4)", s))

    story.append(PageBreak())

    # ════════════════════════════════════════
    # SECTION 2: GOOGLE PLAY CONSOLE
    # ════════════════════════════════════════
    story.append(Paragraph("2. Configuracao no Google Play Console (Android)", s['SectionTitle']))
    story.append(hr())

    # Step 2.1
    story.append(Paragraph("2.1 Criar o App (se ainda nao existe)", s['StepTitle']))
    story.append(numbered(1, "Acesse <b>play.google.com/console</b>", s))
    story.append(numbered(2, "Clique em <b>Create app</b>", s))
    story.append(numbered(3, "Preencha:", s))

    gp_fields = [
        ["Campo", "Valor"],
        ["App name", "Revvy"],
        ["Default language", "pt-BR"],
        ["App or game", "App"],
        ["Free or paid", "Free"],
    ]
    t = Table(gp_fields, colWidths=[w*0.3, w*0.6])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SUCCESS),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, -1), GRAY_50),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    story.append(make_warning_box(w, "Importante: Primeiro Upload", [
        "O Google Play exige que voce faca upload de pelo menos um",
        "APK/AAB antes de poder criar produtos de assinatura.",
        "Publique uma versao em Internal Testing primeiro.",
    ]))
    story.append(Spacer(1, 8))

    # Step 2.2
    story.append(Paragraph("2.2 Criar Assinaturas", s['StepTitle']))
    story.append(numbered(1, "No app, va em <b>Monetize</b> > <b>Products</b> > <b>Subscriptions</b>", s))
    story.append(numbered(2, "Clique em <b>Create subscription</b>", s))
    story.append(Spacer(1, 4))

    # Monthly
    story.append(Paragraph("<b>Assinatura Mensal:</b>", s['BodyBold']))
    gp_monthly = [
        ["Campo", "Valor"],
        ["Product ID", "revvy_pro_monthly"],
        ["Name", "Revvy Pro Mensal"],
    ]
    t = Table(gp_monthly, colWidths=[w*0.3, w*0.6])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SUCCESS),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, -1), GRAY_50),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 4))

    story.append(numbered(3, "Dentro da assinatura, crie um <b>Base Plan</b>:", s))
    bp_monthly = [
        ["Campo", "Valor"],
        ["Base Plan ID", "revvy-pro-monthly-bp"],
        ["Billing period", "1 Month"],
        ["Price (BRL)", "R$ 14,90"],
        ["Auto-renewing", "Yes"],
    ]
    t = Table(bp_monthly, colWidths=[w*0.3, w*0.6])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SUCCESS),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, -1), GRAY_50),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    # Annual
    story.append(Paragraph("<b>Assinatura Anual (repita o processo):</b>", s['BodyBold']))
    gp_annual = [
        ["Campo", "Valor"],
        ["Product ID", "revvy_pro_annual"],
        ["Name", "Revvy Pro Anual"],
        ["Base Plan ID", "revvy-pro-annual-bp"],
        ["Billing period", "1 Year"],
        ["Price (BRL)", "R$ 119,90"],
    ]
    t = Table(gp_annual, colWidths=[w*0.3, w*0.6])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SUCCESS),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, -1), GRAY_50),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    # Step 2.3
    story.append(Paragraph("2.3 Configurar Google Play Real-Time Developer Notifications", s['StepTitle']))
    story.append(Paragraph("Equivalente ao Server Notifications da Apple. Permite que o RevenueCat receba eventos em tempo real.", s['Body']))
    story.append(numbered(1, "Va em <b>Monetize</b> > <b>Monetization setup</b>", s))
    story.append(numbered(2, "Na secao <b>Google Play Billing</b>, encontre <b>Real-time developer notifications</b>", s))
    story.append(numbered(3, "Em <b>Topic name</b>, cole:", s))
    story.append(Spacer(1, 2))
    story.append(Paragraph("(Voce obtera esse valor no dashboard do RevenueCat no passo 4)", s['SmallNote']))
    story.append(Spacer(1, 8))

    # Step 2.4
    story.append(Paragraph("2.4 Service Account (Credenciais para RevenueCat)", s['StepTitle']))
    story.append(Paragraph("O RevenueCat precisa de uma Service Account do Google Cloud para validar compras.", s['Body']))
    story.append(Spacer(1, 4))
    story.append(numbered(1, "Va ao <b>Google Cloud Console</b> (console.cloud.google.com)", s))
    story.append(numbered(2, "Selecione o projeto vinculado ao seu Google Play Console", s))
    story.append(numbered(3, "Va em <b>IAM & Admin</b> > <b>Service Accounts</b>", s))
    story.append(numbered(4, "Clique em <b>Create Service Account</b>", s))
    story.append(numbered(5, "De um nome (ex: <b>revenuecat-integration</b>)", s))
    story.append(numbered(6, "Gere uma <b>JSON key</b> e faca download (voce vai usa-la no passo 4)", s))
    story.append(Spacer(1, 4))

    story.append(numbered(7, "Volte ao <b>Google Play Console</b> > <b>Users and permissions</b>", s))
    story.append(numbered(8, "Adicione o email da Service Account", s))
    story.append(numbered(9, "De permissao de <b>Financial data</b> e <b>Manage orders</b>", s))

    story.append(Spacer(1, 6))
    story.append(make_warning_box(w, "Atencao: Propagacao de Permissoes", [
        "As permissoes da Service Account podem levar ate 24h",
        "para propagar completamente. Se der erro na conexao",
        "com o RevenueCat, espere e tente novamente.",
    ]))

    story.append(PageBreak())

    # ════════════════════════════════════════
    # SECTION 3: REVENUECAT DASHBOARD
    # ════════════════════════════════════════
    story.append(Paragraph("3. Configuracao no RevenueCat Dashboard", s['SectionTitle']))
    story.append(hr())

    story.append(Paragraph("3.1 Criar Projeto", s['StepTitle']))
    story.append(numbered(1, "Acesse <b>app.revenuecat.com</b> e faca login", s))
    story.append(numbered(2, "Clique em <b>Create New Project</b>", s))
    story.append(numbered(3, "Nome do projeto: <b>Revvy</b>", s))
    story.append(Spacer(1, 8))

    story.append(Paragraph("3.2 Adicionar Apps (Plataformas)", s['StepTitle']))
    story.append(Paragraph("Voce precisa adicionar cada plataforma separadamente:", s['Body']))
    story.append(Spacer(1, 4))

    # iOS App
    story.append(Paragraph("<b>App iOS:</b>", s['BodyBold']))
    story.append(numbered(1, "Clique em <b>+ Add App</b> > selecione <b>Apple App Store</b>", s))
    story.append(numbered(2, "Preencha:", s))

    rc_ios = [
        ["Campo", "Valor"],
        ["App name", "Revvy (iOS)"],
        ["Apple Bundle ID", "com.beecodeit.revy"],
        ["Shared Secret", "(o que voce gerou no passo 1.5)"],
    ]
    t = Table(rc_ios, colWidths=[w*0.3, w*0.6])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, -1), GRAY_50),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 4))
    story.append(Paragraph("Anote a <b>Public API Key</b> gerada (comeca com <b>appl_</b>). Voce vai usa-la no codigo.", s['Body']))
    story.append(Spacer(1, 8))

    # Android App
    story.append(Paragraph("<b>App Android:</b>", s['BodyBold']))
    story.append(numbered(1, "Clique em <b>+ Add App</b> > selecione <b>Google Play Store</b>", s))
    story.append(numbered(2, "Preencha:", s))

    rc_android = [
        ["Campo", "Valor"],
        ["App name", "Revvy (Android)"],
        ["Google Play Package", "com.beecodeit.revy"],
        ["Service Account JSON", "(faca upload do arquivo JSON do passo 2.4)"],
    ]
    t = Table(rc_android, colWidths=[w*0.3, w*0.6])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SUCCESS),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, -1), GRAY_50),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 4))
    story.append(Paragraph("Anote a <b>Public API Key</b> gerada (comeca com <b>goog_</b>). Voce vai usa-la no codigo.", s['Body']))

    story.append(PageBreak())

    # ════════════════════════════════════════
    # SECTION 4: CONNECT STORES TO REVENUECAT
    # ════════════════════════════════════════
    story.append(Paragraph("4. Conectar as Lojas ao RevenueCat", s['SectionTitle']))
    story.append(hr())

    story.append(Paragraph("4.1 Conexao Apple (iOS)", s['StepTitle']))
    story.append(Paragraph("No dashboard do RevenueCat, dentro do app iOS:", s['Body']))
    story.append(numbered(1, "Va em <b>App Settings</b> (icone de engrenagem)", s))
    story.append(numbered(2, "Em <b>App Store Connect App-Specific Shared Secret</b>, cole o Shared Secret do passo 1.5", s))
    story.append(numbered(3, "Clique em <b>Save Changes</b>", s))
    story.append(Spacer(1, 8))

    story.append(Paragraph("4.2 Conexao Google Play (Android)", s['StepTitle']))
    story.append(Paragraph("No dashboard do RevenueCat, dentro do app Android:", s['Body']))
    story.append(numbered(1, "Va em <b>App Settings</b>", s))
    story.append(numbered(2, "Em <b>Service Account credentials</b>, faca upload do JSON do passo 2.4", s))
    story.append(numbered(3, "Clique em <b>Save Changes</b>", s))
    story.append(numbered(4, "Copie o <b>Google Cloud Pub/Sub topic</b> que o RevenueCat fornece", s))
    story.append(numbered(5, "Cole esse topic no Google Play Console (passo 2.3)", s))
    story.append(Spacer(1, 8))

    story.append(make_success_box(w, "Validacao", [
        "Apos conectar, o RevenueCat mostra um status verde",
        "indicando que a conexao esta funcionando.",
        "Se aparecer erro, verifique as credenciais e permissoes.",
    ]))

    story.append(Spacer(1, 16))

    # ════════════════════════════════════════
    # SECTION 5: CREATE PRODUCTS IN REVENUECAT
    # ════════════════════════════════════════
    story.append(Paragraph("5. Criar Produtos no RevenueCat", s['SectionTitle']))
    story.append(hr())

    story.append(Paragraph("Os Product IDs no RevenueCat devem corresponder exatamente aos IDs que voce criou nas lojas.", s['Body']))
    story.append(Spacer(1, 4))

    story.append(numbered(1, "No RevenueCat, va em <b>Products</b> (menu lateral)", s))
    story.append(numbered(2, "Clique em <b>+ New</b>", s))
    story.append(Spacer(1, 4))

    products_data = [
        ["Produto", "App Store ID", "Play Store ID"],
        ["Revvy Pro Mensal", "revvy_pro_monthly", "revvy_pro_monthly"],
        ["Revvy Pro Anual", "revvy_pro_annual", "revvy_pro_annual"],
    ]
    t = Table(products_data, colWidths=[w*0.33, w*0.33, w*0.33])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, -1), GRAY_50),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(t)
    story.append(Spacer(1, 6))

    story.append(make_info_box(w, "Dica: Product IDs", [
        "Use o MESMO Product ID nas duas lojas para simplificar.",
        "O RevenueCat permite mapear IDs diferentes, mas IDs iguais",
        "facilitam a manutencao.",
    ]))

    story.append(Spacer(1, 16))

    # ════════════════════════════════════════
    # SECTION 6: ENTITLEMENT + OFFERING
    # ════════════════════════════════════════
    story.append(Paragraph("6. Criar Entitlement e Offering", s['SectionTitle']))
    story.append(hr())

    story.append(Paragraph("6.1 Criar o Entitlement", s['StepTitle']))
    story.append(Paragraph("O Entitlement e o que seu codigo verifica para liberar features. Seu app ja esta configurado para verificar o entitlement <b>\"Revvy Pro\"</b>.", s['Body']))
    story.append(Spacer(1, 4))

    story.append(numbered(1, "No RevenueCat, va em <b>Entitlements</b> (menu lateral)", s))
    story.append(numbered(2, "Clique em <b>+ New</b>", s))
    story.append(numbered(3, "Identifier: <b>Revvy Pro</b> (exatamente como esta no codigo)", s))
    story.append(numbered(4, "Clique em <b>Add</b>", s))
    story.append(numbered(5, "Dentro do entitlement, clique em <b>Attach</b> e adicione os dois produtos:", s))
    story.append(Spacer(1, 2))
    story.append(bullet("<b>revvy_pro_monthly</b>", s))
    story.append(bullet("<b>revvy_pro_annual</b>", s))
    story.append(Spacer(1, 6))

    story.append(make_danger_box(w, "Critico: Nome Exato", [
        "O identifier do entitlement DEVE ser exatamente 'Revvy Pro'",
        "(com espaco e P maiusculo), pois e o que esta hardcoded",
        "no RevenueCatContext.tsx como ENTITLEMENT_ID.",
    ]))

    story.append(Spacer(1, 12))

    story.append(Paragraph("6.2 Criar a Offering", s['StepTitle']))
    story.append(Paragraph("A Offering e o conjunto de pacotes que o app mostra ao usuario. Seu app usa a offering <b>default</b> (padrao do RevenueCat).", s['Body']))
    story.append(Spacer(1, 4))

    story.append(numbered(1, "No RevenueCat, va em <b>Offerings</b> (menu lateral)", s))
    story.append(numbered(2, "A offering <b>default</b> ja vem criada. Clique nela.", s))
    story.append(numbered(3, "Adicione dois <b>Packages</b>:", s))
    story.append(Spacer(1, 4))

    packages_data = [
        ["Package", "Identifier", "Produto Vinculado"],
        ["Monthly", "$rc_monthly", "revvy_pro_monthly"],
        ["Annual", "$rc_annual", "revvy_pro_annual"],
    ]
    t = Table(packages_data, colWidths=[w*0.25, w*0.35, w*0.35])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, -1), GRAY_50),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(t)
    story.append(Spacer(1, 6))

    story.append(make_info_box(w, "Como o App Usa a Offering", [
        "Seu codigo acessa: currentOffering.monthly e currentOffering.annual",
        "Os identifiers $rc_monthly e $rc_annual sao padroes do RevenueCat",
        "e ja sao reconhecidos automaticamente pelo SDK.",
    ]))

    story.append(PageBreak())

    # ════════════════════════════════════════
    # SECTION 7: API KEYS
    # ════════════════════════════════════════
    story.append(Paragraph("7. Trocar API Key de Teste para Producao", s['SectionTitle']))
    story.append(hr())

    story.append(Paragraph("Seu app atualmente usa uma API key de teste. Para producao, voce precisara usar as API keys reais de cada plataforma.", s['Body']))
    story.append(Spacer(1, 6))

    story.append(Paragraph("7.1 Onde Encontrar as API Keys", s['StepTitle']))
    story.append(numbered(1, "No RevenueCat, va em <b>Project Settings</b> > <b>API Keys</b>", s))
    story.append(numbered(2, "Voce vera duas API keys:", s))
    story.append(Spacer(1, 4))

    keys_data = [
        ["Plataforma", "Prefixo", "Uso"],
        ["iOS", "appl_xxxxxxxx", "Apenas builds iOS"],
        ["Android", "goog_xxxxxxxx", "Apenas builds Android"],
    ]
    t = Table(keys_data, colWidths=[w*0.25, w*0.35, w*0.35])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 1), (-1, -1), GRAY_50),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    story.append(Paragraph("7.2 Alterar no Codigo", s['StepTitle']))
    story.append(Paragraph("No arquivo <b>RevenueCatContext.tsx</b>, substitua a API key de teste:", s['Body']))
    story.append(Spacer(1, 4))
    story.append(code_block('// ANTES (teste)', s))
    story.append(code_block('const RC_API_KEY = "test_ZGtkYhfUSqBfNYiCaywQsqloiKs";', s))
    story.append(Spacer(1, 4))
    story.append(code_block('// DEPOIS (producao - use Platform.OS para diferenciar)', s))
    story.append(code_block('import { Platform } from "react-native";', s))
    story.append(code_block('const RC_API_KEY = Platform.OS === "ios"', s))
    story.append(code_block('  ? "appl_SUA_KEY_IOS_AQUI"', s))
    story.append(code_block('  ? "goog_SUA_KEY_ANDROID_AQUI";', s))
    story.append(Spacer(1, 6))

    story.append(make_warning_box(w, "Seguranca", [
        "Idealmente, use variaveis de ambiente (.env) para as API keys.",
        "Nunca commite keys de producao em repositorios publicos.",
        "As API keys do RevenueCat sao PUBLIC keys (nao secretas),",
        "mas e uma boa pratica mante-las fora do codigo fonte.",
    ]))

    story.append(Spacer(1, 16))

    # ════════════════════════════════════════
    # SECTION 8: SANDBOX TESTING
    # ════════════════════════════════════════
    story.append(Paragraph("8. Testar em Sandbox", s['SectionTitle']))
    story.append(hr())

    story.append(Paragraph("8.1 Teste no iOS (Sandbox)", s['StepTitle']))
    story.append(numbered(1, "No App Store Connect, va em <b>Users and Access</b> > <b>Sandbox</b> > <b>Testers</b>", s))
    story.append(numbered(2, "Crie um <b>Sandbox Tester</b> com um email que nao seja Apple ID real", s))
    story.append(numbered(3, "No iPhone/iPad, va em <b>Ajustes</b> > <b>App Store</b> > <b>Sandbox Account</b>", s))
    story.append(numbered(4, "Faca login com o tester criado", s))
    story.append(numbered(5, "Abra o app e tente comprar - a compra sera gratuita (sandbox)", s))
    story.append(Spacer(1, 6))

    story.append(make_info_box(w, "Tempos de Renovacao no Sandbox iOS", [
        "1 semana = 3 minutos | 1 mes = 5 minutos",
        "2 meses = 10 minutos | 1 ano = 1 hora",
        "A assinatura renova ate 12 vezes, depois cancela.",
    ]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("8.2 Teste no Android (License Testers)", s['StepTitle']))
    story.append(numbered(1, "No Google Play Console, va em <b>Settings</b> > <b>License testing</b>", s))
    story.append(numbered(2, "Adicione o email da conta Google do dispositivo de teste", s))
    story.append(numbered(3, "Publique o app no <b>Internal Testing</b> track", s))
    story.append(numbered(4, "Instale via link do Internal Testing", s))
    story.append(numbered(5, "Tente comprar - o Google mostrara que e uma compra de teste", s))
    story.append(Spacer(1, 8))

    story.append(Paragraph("8.3 Verificar no RevenueCat Dashboard", s['StepTitle']))
    story.append(Paragraph("Apos uma compra de teste:", s['Body']))
    story.append(numbered(1, "Va ao RevenueCat > <b>Customers</b>", s))
    story.append(numbered(2, "Busque pelo App User ID (o user.id do seu AuthContext)", s))
    story.append(numbered(3, "Verifique se o entitlement <b>Revvy Pro</b> aparece como <b>Active</b>", s))
    story.append(numbered(4, "Confirme que o app liberou as features Pro", s))

    story.append(PageBreak())

    # ════════════════════════════════════════
    # SECTION 9: FINAL CHECKLIST
    # ════════════════════════════════════════
    story.append(Paragraph("9. Checklist Final antes de Publicar", s['SectionTitle']))
    story.append(hr())
    story.append(Spacer(1, 8))

    # App Store Connect
    story.append(Paragraph("<b>App Store Connect (iOS)</b>", s['BodyBold']))
    story.append(check("App criado com Bundle ID com.beecodeit.revy", s))
    story.append(check("Subscription Group 'Revvy Pro' criado", s))
    story.append(check("Produto revvy_pro_monthly criado (1 Month, R$ 14,90)", s))
    story.append(check("Produto revvy_pro_annual criado (1 Year, R$ 119,90)", s))
    story.append(check("Precos configurados para todas as regioes", s))
    story.append(check("Localizations adicionadas (pt-BR no minimo)", s))
    story.append(check("Server Notifications V2 configuradas", s))
    story.append(check("Shared Secret gerado e anotado", s))
    story.append(check("Review Information preenchida (screenshot da subscription)", s))
    story.append(Spacer(1, 10))

    # Google Play Console
    story.append(Paragraph("<b>Google Play Console (Android)</b>", s['BodyBold']))
    story.append(check("App criado com package com.beecodeit.revy", s))
    story.append(check("Primeiro AAB/APK enviado (Internal Testing)", s))
    story.append(check("Subscription revvy_pro_monthly criada com Base Plan", s))
    story.append(check("Subscription revvy_pro_annual criada com Base Plan", s))
    story.append(check("Service Account criada e JSON baixado", s))
    story.append(check("Service Account adicionada ao Play Console com permissoes", s))
    story.append(check("Real-time Developer Notifications configurado", s))
    story.append(check("License Testers adicionados", s))
    story.append(Spacer(1, 10))

    # RevenueCat
    story.append(Paragraph("<b>RevenueCat Dashboard</b>", s['BodyBold']))
    story.append(check("Projeto 'Revvy' criado", s))
    story.append(check("App iOS adicionado com Shared Secret", s))
    story.append(check("App Android adicionado com Service Account JSON", s))
    story.append(check("Produtos revvy_pro_monthly e revvy_pro_annual criados", s))
    story.append(check("Entitlement 'Revvy Pro' criado (nome exato!)", s))
    story.append(check("Ambos os produtos vinculados ao entitlement", s))
    story.append(check("Offering 'default' com packages Monthly e Annual", s))
    story.append(check("API keys de producao anotadas (appl_ e goog_)", s))
    story.append(Spacer(1, 10))

    # Code
    story.append(Paragraph("<b>No Codigo (RevenueCatContext.tsx)</b>", s['BodyBold']))
    story.append(check("API key de teste substituida pelas keys de producao", s))
    story.append(check("Platform.OS usado para diferenciar iOS/Android", s))
    story.append(check("Debug logs desativados para producao", s))
    story.append(check("Testado em sandbox iOS e Android", s))
    story.append(check("Restore purchases funcionando", s))
    story.append(Spacer(1, 10))

    # Testing
    story.append(Paragraph("<b>Testes Realizados</b>", s['BodyBold']))
    story.append(check("Compra mensal funciona (sandbox)", s))
    story.append(check("Compra anual funciona (sandbox)", s))
    story.append(check("Features Pro liberadas apos compra", s))
    story.append(check("Features bloqueadas sem assinatura", s))
    story.append(check("Restore purchases restaura assinatura existente", s))
    story.append(check("Customer Center permite gerenciar assinatura", s))
    story.append(check("Cancelamento remove acesso Pro apos expiracao", s))
    story.append(check("Troca de plano (upgrade/downgrade) funciona", s))

    story.append(Spacer(1, 16))
    story.append(hr())
    story.append(Spacer(1, 4))
    story.append(Paragraph("Guia gerado para o app <b>Revvy</b> (com.beecodeit.revy) | RevenueCat + react-native-purchases v9.10.4", s['SmallNote']))

    # ── Build ──
    doc.build(story)
    print(f"PDF gerado com sucesso: {OUTPUT_PATH}")


if __name__ == "__main__":
    build_pdf()
