from datetime import date


def calculate_age(dob, reference_date):

    return (

        reference_date.year

        - dob.year

        - (

            (reference_date.month,
             reference_date.day)

            <

            (dob.month,
             dob.day)

        )

    )


def get_age_group(

        dob,

        reference_date

):

    age = calculate_age(
        dob,
        reference_date
    )

    if age <= 14:

        return "sub_junior"

    elif age <= 17:

        return "junior"

    return "senior"