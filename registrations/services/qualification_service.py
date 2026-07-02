from results.models import FinalResult
from registrations.models import Registration
from django.utils import timezone

class QualificationService:

    @staticmethod
    def get_state_qualifiers(district_meet):

        return Registration.objects.filter(
            meet=district_meet,
            qualified_for_next_level=True
        ).select_related(
            "swimmer",
            "event"
        )

    @staticmethod
    def get_national_qualifiers(state_meet):

        return Registration.objects.filter(
            meet=state_meet,
            qualified_for_next_level=True
        ).select_related(
            "swimmer",
            "event"
        )

    @staticmethod
    def mark_qualifiers(final):

        results = (
            FinalResult.objects
            .filter(
                final=final,
                status="swam"
            )
            .order_by("rank")
        )


        for result in results:

            registration = Registration.objects.filter(
                swimmer=result.swimmer,
                event=final.event
            ).first()

            if not registration:
                continue

            qualifying_position = (
                registration.meet.qualifying_position
            )

            qualification_method = (
                registration.meet.qualification_method
            )

            if qualification_method == "POSITION":

                if (
                        registration.meet.qualifying_position
                        and
                        result.rank <= registration.meet.qualifying_position
                ):
                    registration.qualified_for_next_level = True


            elif qualification_method == "MEDAL":

                medals = (
                    registration.meet.qualifying_medals
                    .lower()
                    .split(",")
                )

                if result.medal.lower() in medals:
                    registration.qualified_for_next_level = True


            elif qualification_method == "TIME":

                standard = (
                    registration.meet.qualifying_time_standard
                )

                if (
                        standard
                        and
                        result.finish_time
                        and
                        result.finish_time <= standard
                ):
                    registration.qualified_for_next_level = True


            elif qualification_method == "POINTS":

                pass

                if registration.qualified_for_next_level:
                    continue

                if registration.qualified_for_next_level:
                    registration.qualification_position = (
                        result.rank
                    )

                    registration.qualification_medal = (
                        result.medal
                    )

                    registration.qualification_time = (
                        result.finish_time
                    )

                    registration.qualified_at = (
                        timezone.now()
                    )

                    registration.qualified_by_result = (
                        result
                    )

                    registration.save()

                registration.qualified_for_next_level = True

                registration.qualification_position = result.rank

                registration.qualification_medal = (
                    result.medal
                )

                registration.qualification_time = (
                    result.finish_time
                )

                registration.save()