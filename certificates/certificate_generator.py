from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from django.conf import settings
import os


class CertificateGenerator:

    def __init__(self, pdf):

        self.pdf = pdf

        self.width = 595
        self.height = 842

    from reportlab.lib.colors import HexColor

    def draw_background(
            self,
            template_name
    ):
        p = self.pdf

        template_path = os.path.join(
            settings.MEDIA_ROOT,
            "certificates",
            "templates",
            template_name
        )

        if not os.path.exists(template_path):
            raise FileNotFoundError(
                f"Template not found : {template_path}"
            )

        background = ImageReader(template_path)

        p.drawImage(
            background,
            0,
            0,
            width=self.width,
            height=self.height
        )

    def write_name(self, name):
        p = self.pdf

        p.setFillColor(HexColor("#0B2E59"))

        p.setFont("Times-Bold", 24)

        p.drawCentredString(
            297,
            460,
            name.upper()
        )

    def write_association(self, association):
        p = self.pdf

        p.setFillColor(HexColor("#C1272D"))

        p.setFont("Helvetica-Bold", 14)

        p.drawCentredString(
            297,
            397,
            association.upper()
        )

    def write_meet(self, meet):
        p = self.pdf

        p.setFillColor(HexColor("#183A72"))

        p.setFont("Helvetica-Bold",14)

        p.drawCentredString(
            302,
            332,
            meet.upper()
        )

    def write_event(self, event):
        p = self.pdf

        p.setFillColor(HexColor("#183A72"))

        p.setFont("Helvetica-Bold", 15)

        p.drawString(
            300,
            288,
            event
        )

    def write_category(self, category):
        p = self.pdf

        p.setFillColor(HexColor("#183A72"))

        p.setFont("Helvetica-Bold", 15)

        p.drawString(
            300,
            244,
            category
        )

    def write_date(self, date):
        p = self.pdf

        p.setFillColor(HexColor("#183A72"))

        p.setFont("Helvetica-Bold", 15)

        p.drawString(
            300,
            200,
            date
        )

    def write_certificate_number(self, number):
        p = self.pdf

        p.setFillColor(HexColor("#C1272D"))

        p.setFont("Helvetica-Bold", 9)

        p.drawString(
            140,
            772,
            number
        )

    def write_medal_name(self, name):
        p = self.pdf

        p.setFillColor(HexColor("#0B2E59"))

        p.setFont("Times-Bold", 18)

        p.drawCentredString(
            297,
            422,
            name.upper()
        )

    def write_medal_association(self, association):
        p = self.pdf

        p.setFillColor(HexColor("#C1272D"))

        p.setFont("Helvetica-Bold", 13)

        p.drawCentredString(
            297,
            366,
            association.upper()
        )

    def write_medal_meet(self, meet):
        p = self.pdf

        p.setFillColor(HexColor("#183A72"))

        p.setFont("Helvetica-Bold", 14)

        p.drawCentredString(
            297,
            309,
            meet.upper()
        )

    def write_medal_event(self, event):
        p = self.pdf

        p.setFillColor(HexColor("#183A72"))

        p.setFont("Helvetica-Bold", 15)

        p.drawString(
            300,
            267,
            event
        )

    def write_medal_category(self, category):
        p = self.pdf

        p.setFillColor(HexColor("#183A72"))

        p.setFont("Helvetica-Bold", 15)

        p.drawString(
            300,
            221,
            category
        )

    def write_medal_date(self, date):
        p = self.pdf

        p.setFillColor(HexColor("#183A72"))

        p.setFont("Helvetica-Bold", 15)

        p.drawString(
            300,
            176,
            date
        )

    def write_medal_certificate_number(self, number):
        p = self.pdf

        p.setFillColor(HexColor("#C1272D"))

        p.setFont("Helvetica-Bold", 7)

        p.drawString(
            138,
            774,
            number
        )