from registrations.models import Registration
from results.models import FinalResult
from registrations.models import SwimmerBestTime

class SwimmerTimelineService:

    @staticmethod
    def get_timeline(swimmer):

        registrations = (
            Registration.objects
            .filter(swimmer=swimmer)
            .select_related(
                "meet",
                "event",
                "qualification_source_meet"
            )
            .order_by("meet__start_date")
        )

        timeline = []

        gold_medals = 0
        silver_medals = 0
        bronze_medals = 0

        achievements = []

        highest_level = swimmer.highest_level_reached

        best_times = (
            SwimmerBestTime.objects
            .filter(
                swimmer=swimmer
            )
        )



        for registration in registrations:

            final_result = (
                FinalResult.objects
                .filter(
                    swimmer=swimmer,
                    final__event=registration.event
                )
                .first()
            )

            if final_result:

                if final_result.medal == "gold":
                    gold_medals += 1

                elif final_result.medal == "silver":
                    silver_medals += 1

                elif final_result.medal == "bronze":
                    bronze_medals += 1

            timeline.append({

                "year":
                    registration.meet.start_date.year,

                "meet":
                    registration.meet.name,

                "event":
                    str(registration.event),

                "rank":
                    final_result.rank if final_result else None,

                "medal":
                    final_result.medal if final_result else None,

                "qualified":
                    registration.qualified_for_next_level,

                "qualification_position":
                    registration.qualification_position,

                "qualification_source":
                    (
                        registration.qualification_source_meet.name
                        if registration.qualification_source_meet
                        else None
                    )
            })

            qualified_count = registrations.filter(
                qualified_for_next_level=True
            ).count()

            if gold_medals >= 1:
                achievements.append(
                    "🥇 First Gold Medal"
                )

            if gold_medals >= 5:
                achievements.append(
                    "🏆 Five Gold Medals"
                )

            if registrations.count() >= 10:
                achievements.append(
                    "🏊 10 Career Meets"
                )

            if registrations.count() >= 25:
                achievements.append(
                    "🏊 25 Career Meets"
                )

            if qualified_count >= 1:
                achievements.append(
                    "🏆 State Qualifier"
                )

            if highest_level == "STATE":
                achievements.append(
                    "🏆 State Swimmer"
                )

            if highest_level == "NATIONAL":
                achievements.append(
                    "🇮🇳 National Swimmer"
                )

            medal_breakdown = {

                "gold": gold_medals,

                "silver": silver_medals,

                "bronze": bronze_medals

            }

        return {

            "timeline": timeline,

            "statistics": {

                "gold_medals": gold_medals,

                "silver_medals": silver_medals,

                "bronze_medals": bronze_medals,

                "total_meets": registrations.count(),

                "highest_level_reached": highest_level,

                "qualification_count": qualified_count,

                "total_best_times": best_times.count()

            },

            "medal_breakdown": medal_breakdown,

            "achievements": achievements

        }