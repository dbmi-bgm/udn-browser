################################################
#   Libraries
################################################

import click
import gzip
import os


################################################
#   Top level variables
################################################


################################################
#   Functions
################################################


@click.command()
@click.help_option("--help", "-h")
@click.option(
    "-a",
    "--annotated-vcf",
    required=True,
    type=str,
    help="Annotated VCF (gzipped)",
)

def main(annotated_vcf):
    """This scripts extracts all go_terms from the VCF, this list can be used as data source for factets
    """


    go_terms_list = []

    with gzip.open(annotated_vcf, 'rt') as gz_file:
        for line in gz_file:
            if line.startswith("#"):
                continue
            # Process each line of the gzipped file here
            # Replace the print statement with your desired logic
            l  = line.strip()
            l_ = l.split("\t")
            infos = l_[7]
            infos_ = infos.split(";")
            for info in infos_:
                if info.startswith("go_terms"):
                    go_terms_ = info.split("=")
                    go_terms_str = go_terms_[1]
                    go_terms = go_terms_str.split("|")
                    go_terms_list += go_terms

    go_terms_list_unique = list(set(go_terms_list))
    print(go_terms_list_unique, len(go_terms_list_unique))


 

    



if __name__ == "__main__":
    main()
